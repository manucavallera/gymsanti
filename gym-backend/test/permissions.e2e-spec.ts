import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

// Regression tests for the permission holes found in the October 2026 smoke test,
// plus the coach-managed student accounts.
describe('Permissions (e2e)', () => {
  let app: INestApplication;
  let http: ReturnType<INestApplication['getHttpServer']>;
  let n = 0;

  const signupCoach = async () => {
    const res = await request(http).post('/auth/register')
      .send({ email: `coach${++n}@t.com`, name: `Coach ${n}`, password: '123456', role: 'coach', coachCode: 'test-secret' })
      .expect(201);
    return res.body.token as string;
  };

  const createStudent = async (coachToken: string, email = `alumno${++n}@t.com`) => {
    const res = await request(http).post('/coach/students').set('Authorization', `Bearer ${coachToken}`)
      .send({ email, name: 'Alumno', password: '123456' })
      .expect(201);
    const login = await request(http).post('/auth/login').send({ email, password: '123456' }).expect(201);
    return { id: res.body.id as number, token: login.body.token as string, body: res.body };
  };

  beforeAll(async () => {
    // Set before AppModule loads: the DB config is read when the module is imported.
    process.env.DB_PATH = ':memory:';
    process.env.SETUP_SECRET = 'test-secret';
    const { AppModule } = await import('../src/app.module');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    http = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('public signup', () => {
    it('rejects students signing up on their own', async () => {
      await request(http).post('/auth/register').send({ email: 'solo@t.com', name: 'Solo', password: '123456' }).expect(403);
    });

    it('rejects role=coach without code', async () => {
      await request(http).post('/auth/register').send({ email: 'nocode@t.com', name: 'Sin codigo', password: '123456', role: 'coach' }).expect(401);
    });

    it('rejects role=coach with wrong code', async () => {
      await request(http).post('/auth/register').send({ email: 'bad@t.com', name: 'Malo', password: '123456', role: 'coach', coachCode: 'nope' }).expect(401);
    });

    it('accepts role=coach with the right code', async () => {
      const token = await signupCoach();
      const me = await request(http).get('/auth/me').set('Authorization', `Bearer ${token}`).expect(200);
      expect(me.body.role).toBe('coach');
    });
  });

  describe('coach creates students', () => {
    it('creates a student login assigned to the coach, without password in the response', async () => {
      const coach = await signupCoach();
      const s = await createStudent(coach, 'Mixed.Case@T.com');
      expect(s.body.password).toBeUndefined();
      expect(s.body.email).toBe('mixed.case@t.com');
      const list = await request(http).get('/coach/students').set('Authorization', `Bearer ${coach}`).expect(200);
      expect(list.body.map((u: { id: number }) => u.id)).toContain(s.id);
    });

    it('student cannot create students', async () => {
      const coach = await signupCoach();
      const s = await createStudent(coach);
      await request(http).post('/coach/students').set('Authorization', `Bearer ${s.token}`)
        .send({ email: 'x@t.com', name: 'Intruso', password: '123456' }).expect(403);
    });

    it('rejects a duplicate email', async () => {
      const coach = await signupCoach();
      await createStudent(coach, 'dup@t.com');
      await request(http).post('/coach/students').set('Authorization', `Bearer ${coach}`)
        .send({ email: 'dup@t.com', name: 'Dup', password: '123456' }).expect(409);
    });

    it('coach sets a new password for own student only', async () => {
      const coach = await signupCoach();
      const other = await signupCoach();
      const s = await createStudent(coach, 'pw@t.com');
      await request(http).patch(`/coach/students/${s.id}/password`).set('Authorization', `Bearer ${other}`).send({ password: 'nueva123' }).expect(403);
      await request(http).patch(`/coach/students/${s.id}/password`).set('Authorization', `Bearer ${coach}`).send({ password: 'nueva123' }).expect(200);
      await request(http).post('/auth/login').send({ email: 'pw@t.com', password: 'nueva123' }).expect(201);
      await request(http).post('/auth/login').send({ email: 'pw@t.com', password: '123456' }).expect(401);
    });
  });

  describe('routines and nutrition', () => {
    let coach: string;
    let otherCoach: string;
    let student: { id: number; token: string };

    beforeAll(async () => {
      coach = await signupCoach();
      otherCoach = await signupCoach();
      student = await createStudent(coach);
    });

    it('student cannot create a routine', async () => {
      await request(http).post(`/routines/coach/students/${student.id}`).set('Authorization', `Bearer ${student.token}`).send({ name: 'Falsa' }).expect(403);
    });

    it('student cannot create a meal plan', async () => {
      await request(http).post(`/nutrition/coach/students/${student.id}`).set('Authorization', `Bearer ${student.token}`).send({ name: 'Falso' }).expect(403);
    });

    it('coach cannot create a routine for a student of another coach', async () => {
      await request(http).post(`/routines/coach/students/${student.id}`).set('Authorization', `Bearer ${otherCoach}`).send({ name: 'Ajena' }).expect(403);
    });

    it('coach cannot create a meal plan for a student of another coach', async () => {
      await request(http).post(`/nutrition/coach/students/${student.id}`).set('Authorization', `Bearer ${otherCoach}`).send({ name: 'Ajeno' }).expect(403);
    });

    it('assigned coach creates a routine and the student sees the newest one', async () => {
      const auth = { Authorization: `Bearer ${coach}` };
      await request(http).post(`/routines/coach/students/${student.id}`).set(auth).send({ name: 'Primera' }).expect(201);
      const second = await request(http).post(`/routines/coach/students/${student.id}`).set(auth).send({ name: 'Segunda' }).expect(201);
      const mine = await request(http).get('/routines/my').set('Authorization', `Bearer ${student.token}`).expect(200);
      expect(mine.body.id).toBe(second.body.id);
    });
  });

  describe('assign student', () => {
    it('does not steal a student from another coach', async () => {
      const c1 = await signupCoach();
      const c2 = await signupCoach();
      const s = await createStudent(c1);
      await request(http).post(`/coach/students/${s.id}/assign`).set('Authorization', `Bearer ${c2}`).expect(409);
    });
  });

  describe('measurements', () => {
    it('coach records measurements, BMI is calculated and height is reused', async () => {
      const coach = await signupCoach();
      const s = await createStudent(coach);
      const auth = { Authorization: `Bearer ${coach}` };
      const first = await request(http).post(`/coach/students/${s.id}/measurements`).set(auth)
        .send({ weight: 80, height: 180, back: 110, arm: 35, leg: 58, restingHr: 60, maxHr: 190 }).expect(201);
      expect(first.body.bmi).toBe(24.7);
      const second = await request(http).post(`/coach/students/${s.id}/measurements`).set(auth).send({ weight: 72 }).expect(201);
      expect(second.body.height).toBe(180);
      expect(second.body.bmi).toBe(22.2);
      const mine = await request(http).get('/measurements').set('Authorization', `Bearer ${s.token}`).expect(200);
      expect(mine.body).toHaveLength(2);
      expect(mine.body[0].id).toBe(second.body.id);
    });

    it('student cannot create or delete measurements', async () => {
      const coach = await signupCoach();
      const s = await createStudent(coach);
      await request(http).post('/measurements').set('Authorization', `Bearer ${s.token}`).send({ weight: 70 }).expect(404);
      await request(http).post(`/coach/students/${s.id}/measurements`).set('Authorization', `Bearer ${s.token}`).send({ weight: 70 }).expect(403);
    });

    it('other coach cannot record measurements for a student that is not theirs', async () => {
      const coach = await signupCoach();
      const other = await signupCoach();
      const s = await createStudent(coach);
      await request(http).post(`/coach/students/${s.id}/measurements`).set('Authorization', `Bearer ${other}`).send({ weight: 70 }).expect(403);
    });

    it('rejects out of range values', async () => {
      const coach = await signupCoach();
      const s = await createStudent(coach);
      await request(http).post(`/coach/students/${s.id}/measurements`).set('Authorization', `Bearer ${coach}`).send({ restingHr: 500 }).expect(400);
    });
  });
});
