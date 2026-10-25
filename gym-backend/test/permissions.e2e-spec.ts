import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

// Regression tests for the permission holes found in the October 2026 smoke test.
describe('Permissions (e2e)', () => {
  let app: INestApplication;
  let http: ReturnType<INestApplication['getHttpServer']>;

  const register = (body: Record<string, unknown>) => request(http).post('/auth/register').send({ password: '123456', ...body });

  beforeAll(async () => {
    // Set before AppModule loads: the DB path is read when the module is imported.
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

  describe('coach signup', () => {
    it('rejects role=coach without code', async () => {
      await register({ email: 'nocode@t.com', name: 'Sin codigo', role: 'coach' }).expect(401);
    });

    it('rejects role=coach with wrong code', async () => {
      await register({ email: 'bad@t.com', name: 'Codigo malo', role: 'coach', coachCode: 'nope' }).expect(401);
    });

    it('accepts role=coach with the right code', async () => {
      const res = await register({ email: 'ok@t.com', name: 'Coach ok', role: 'coach', coachCode: 'test-secret' }).expect(201);
      expect(res.body.user.role).toBe('coach');
    });

    it('rejects a student pointing at a non-coach coachId', async () => {
      const plain = await register({ email: 'plain@t.com', name: 'Plain' }).expect(201);
      await register({ email: 'x@t.com', name: 'X', coachId: plain.body.user.id }).expect(400);
    });
  });

  describe('routines and nutrition', () => {
    let coach: string;
    let otherCoach: string;
    let student: string;
    let studentId: number;

    beforeAll(async () => {
      coach = (await register({ email: 'c1@t.com', name: 'Coach 1', role: 'coach', coachCode: 'test-secret' })).body.token;
      otherCoach = (await register({ email: 'c2@t.com', name: 'Coach 2', role: 'coach', coachCode: 'test-secret' })).body.token;
      const s = await register({ email: 's1@t.com', name: 'Alumno 1' });
      student = s.body.token;
      studentId = s.body.user.id;
      await request(http).post(`/coach/students/${studentId}/assign`).set('Authorization', `Bearer ${coach}`).expect(201);
    });

    it('student cannot create a routine', async () => {
      await request(http).post(`/routines/coach/students/${studentId}`).set('Authorization', `Bearer ${student}`).send({ name: 'Falsa' }).expect(403);
    });

    it('student cannot create a meal plan', async () => {
      await request(http).post(`/nutrition/coach/students/${studentId}`).set('Authorization', `Bearer ${student}`).send({ name: 'Falso' }).expect(403);
    });

    it('coach cannot create a routine for a student of another coach', async () => {
      await request(http).post(`/routines/coach/students/${studentId}`).set('Authorization', `Bearer ${otherCoach}`).send({ name: 'Ajena' }).expect(403);
    });

    it('coach cannot create a meal plan for a student of another coach', async () => {
      await request(http).post(`/nutrition/coach/students/${studentId}`).set('Authorization', `Bearer ${otherCoach}`).send({ name: 'Ajeno' }).expect(403);
    });

    it('assigned coach creates a routine and the student sees the newest one', async () => {
      const auth = { Authorization: `Bearer ${coach}` };
      await request(http).post(`/routines/coach/students/${studentId}`).set(auth).send({ name: 'Primera' }).expect(201);
      const second = await request(http).post(`/routines/coach/students/${studentId}`).set(auth).send({ name: 'Segunda' }).expect(201);
      const mine = await request(http).get('/routines/my').set('Authorization', `Bearer ${student}`).expect(200);
      expect(mine.body.id).toBe(second.body.id);
    });
  });

  describe('assign student', () => {
    it('does not steal a student from another coach and never returns the password', async () => {
      const c1 = (await register({ email: 'a1@t.com', name: 'A1', role: 'coach', coachCode: 'test-secret' })).body.token;
      const c2 = (await register({ email: 'a2@t.com', name: 'A2', role: 'coach', coachCode: 'test-secret' })).body.token;
      const s = (await register({ email: 'as@t.com', name: 'AS' })).body.user.id;

      const first = await request(http).post(`/coach/students/${s}/assign`).set('Authorization', `Bearer ${c1}`).expect(201);
      expect(first.body.password).toBeUndefined();

      await request(http).post(`/coach/students/${s}/assign`).set('Authorization', `Bearer ${c2}`).expect(409);
    });

    it('does not assign another coach as a student', async () => {
      const c1 = await register({ email: 'b1@t.com', name: 'B1', role: 'coach', coachCode: 'test-secret' });
      const c2 = await register({ email: 'b2@t.com', name: 'B2', role: 'coach', coachCode: 'test-secret' });
      await request(http).post(`/coach/students/${c2.body.user.id}/assign`).set('Authorization', `Bearer ${c1.body.token}`).expect(400);
    });
  });
});
