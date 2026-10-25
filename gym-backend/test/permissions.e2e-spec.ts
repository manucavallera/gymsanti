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

  describe('payments', () => {
    it('coach records a pending fee and a paid fee; student only reads them', async () => {
      const coach = await signupCoach();
      const s = await createStudent(coach);
      const auth = { Authorization: `Bearer ${coach}` };
      const pending = await request(http).post(`/coach/students/${s.id}/payments`).set(auth)
        .send({ description: 'Cuota noviembre', amount: 25000, period: 'Noviembre 2026', dueDate: '2026-11-10' }).expect(201);
      expect(pending.body.status).toBe('pendiente');
      const paid = await request(http).post(`/coach/students/${s.id}/payments`).set(auth)
        .send({ description: 'Cuota octubre', amount: 25000, paid: true, method: 'transferencia' }).expect(201);
      expect(paid.body.status).toBe('pagado');
      expect(paid.body.method).toBe('transferencia');
      expect(paid.body.paidAt).toBeTruthy();

      const mine = await request(http).get('/payments').set('Authorization', `Bearer ${s.token}`).expect(200);
      expect(mine.body).toHaveLength(2);
    });

    it('student cannot create fees, mark them paid or delete them', async () => {
      const coach = await signupCoach();
      const s = await createStudent(coach);
      const fee = await request(http).post(`/coach/students/${s.id}/payments`).set('Authorization', `Bearer ${coach}`)
        .send({ description: 'Cuota', amount: 1000 }).expect(201);
      const st = { Authorization: `Bearer ${s.token}` };
      await request(http).post('/payments').set(st).send({ description: 'Me pago solo', amount: 1 }).expect(403);
      await request(http).patch(`/payments/${fee.body.id}/pay`).set(st).send({ method: 'efectivo' }).expect(404);
      await request(http).delete(`/payments/${fee.body.id}`).set(st).expect(404);
      await request(http).patch(`/coach/students/${s.id}/payments/${fee.body.id}/pay`).set(st).send({ method: 'efectivo' }).expect(403);
    });

    it('store checkout still reaches the stock check (not blocked as a fee)', async () => {
      const coach = await signupCoach();
      const s = await createStudent(coach);
      const products = await request(http).get('/products').expect(200);
      await request(http).post('/payments').set('Authorization', `Bearer ${s.token}`)
        .send({ description: 'Compra', amount: 1, items: [{ productId: products.body[0].id, quantity: 1 }] }).expect(409);
    });

    it('rejects a fee without description instead of failing with 500', async () => {
      const coach = await signupCoach();
      const s = await createStudent(coach);
      await request(http).post(`/coach/students/${s.id}/payments`).set('Authorization', `Bearer ${coach}`).send({ amount: 1000 }).expect(400);
    });
  });

  describe('goals', () => {
    it('coach creates, toggles and deletes goals; student only reads', async () => {
      const coach = await signupCoach();
      const s = await createStudent(coach);
      const auth = { Authorization: `Bearer ${coach}` };
      const g = await request(http).post(`/coach/students/${s.id}/goals`).set(auth)
        .send({ title: 'Bajar 5 kg', category: 'peso', targetValue: '75 kg', targetDate: '2027-01-31' }).expect(201);
      const toggled = await request(http).patch(`/coach/students/${s.id}/goals/${g.body.id}/toggle`).set(auth).expect(200);
      expect(toggled.body.achieved).toBe(true);

      const st = { Authorization: `Bearer ${s.token}` };
      const mine = await request(http).get('/goals').set(st).expect(200);
      expect(mine.body).toHaveLength(1);
      await request(http).post('/goals').set(st).send({ title: 'Propio', category: 'otro' }).expect(404);
      await request(http).patch(`/goals/${g.body.id}/toggle`).set(st).expect(404);
      await request(http).post(`/coach/students/${s.id}/goals`).set(st).send({ title: 'Propio', category: 'otro' }).expect(403);

      await request(http).delete(`/coach/students/${s.id}/goals/${g.body.id}`).set(auth).expect(200);
      expect((await request(http).get('/goals').set(st)).body).toHaveLength(0);
    });

    it('rejects an invalid category and another coach', async () => {
      const coach = await signupCoach();
      const other = await signupCoach();
      const s = await createStudent(coach);
      await request(http).post(`/coach/students/${s.id}/goals`).set('Authorization', `Bearer ${coach}`).send({ title: 'X objetivo', category: 'nada' }).expect(400);
      await request(http).post(`/coach/students/${s.id}/goals`).set('Authorization', `Bearer ${other}`).send({ title: 'Ajeno', category: 'otro' }).expect(403);
    });
  });

  describe('nutrition plan', () => {
    it('stores the daily guide and ignores studentId/coachId in the body', async () => {
      const coach = await signupCoach();
      const s1 = await createStudent(coach);
      const s2 = await createStudent(coach);
      const auth = { Authorization: `Bearer ${coach}` };
      const plan = await request(http).post(`/nutrition/coach/students/${s1.id}`).set(auth)
        .send({ name: 'Plan corte', dailyProtein: 160, waterLiters: 2.5, vitamins: 'Vitamina D 2000 UI', habits: 'Dormir 8 horas' }).expect(201);
      expect(plan.body.waterLiters).toBe(2.5);

      await request(http).patch(`/nutrition/coach/${plan.body.id}`).set(auth)
        .send({ supplements: 'Creatina 5 g', studentId: s2.id, coachId: 999 }).expect(200);

      const mine = await request(http).get('/nutrition/my').set('Authorization', `Bearer ${s1.token}`).expect(200);
      expect(mine.body.supplements).toBe('Creatina 5 g');
      expect(mine.body.vitamins).toBe('Vitamina D 2000 UI');
      const other = await request(http).get('/nutrition/my').set('Authorization', `Bearer ${s2.token}`).expect(200);
      expect(other.body).toEqual({});
    });

    it('requires a name to create a plan, a day or a meal', async () => {
      const coach = await signupCoach();
      const s = await createStudent(coach);
      const auth = { Authorization: `Bearer ${coach}` };
      await request(http).post(`/nutrition/coach/students/${s.id}`).set(auth).send({ dailyCalories: 2000 }).expect(400);
      const plan = await request(http).post(`/nutrition/coach/students/${s.id}`).set(auth).send({ name: 'Plan' }).expect(201);
      await request(http).post(`/nutrition/coach/${plan.body.id}/days`).set(auth).send({}).expect(400);
      const day = await request(http).post(`/nutrition/coach/${plan.body.id}/days`).set(auth).send({ name: 'Lunes' }).expect(201);
      await request(http).post(`/nutrition/coach/days/${day.body.id}/meals`).set(auth).send({ calories: 300 }).expect(400);
      await request(http).post(`/nutrition/coach/days/${day.body.id}/meals`).set(auth)
        .send({ name: 'Desayuno', time: '08:00', calories: 450, protein: 30, carbs: 50, fats: 12, foods: 'Avena' }).expect(201);
    });
  });

  describe('routine edits and logs', () => {
    const setup = async () => {
      const coach = await signupCoach();
      const s1 = await createStudent(coach);
      const s2 = await createStudent(coach);
      const auth = { Authorization: `Bearer ${coach}` };
      const routine = await request(http).post(`/routines/coach/students/${s1.id}`).set(auth).send({ name: 'Fuerza' }).expect(201);
      const day = await request(http).post(`/routines/coach/${routine.body.id}/days`).set(auth).send({ name: 'Dia 1' }).expect(201);
      const ex = await request(http).post(`/routines/coach/days/${day.body.id}/exercises`).set(auth)
        .send({ name: 'Sentadilla', sets: 4, reps: '8' }).expect(201);
      return { coach, auth, s1, s2, routine: routine.body, ex: ex.body };
    };

    it('PATCH cannot move a routine to another student', async () => {
      const { auth, s1, s2, routine } = await setup();
      await request(http).patch(`/routines/coach/${routine.id}`).set(auth).send({ name: 'Fuerza B', studentId: s2.id }).expect(200);
      const mine = await request(http).get('/routines/my').set('Authorization', `Bearer ${s1.token}`).expect(200);
      expect(mine.body.name).toBe('Fuerza B');
      const other = await request(http).get('/routines/my').set('Authorization', `Bearer ${s2.token}`).expect(200);
      expect(other.body).toEqual({});
    });

    it('student logs only own exercises and cannot overwrite other logs', async () => {
      const { s1, s2, ex } = await setup();
      const log = await request(http).post(`/routines/exercises/${ex.id}/log`).set('Authorization', `Bearer ${s1.token}`).send({ weight: 100 }).expect(201);
      await request(http).post(`/routines/exercises/${ex.id}/log`).set('Authorization', `Bearer ${s2.token}`).send({ weight: 5 }).expect(404);
      await request(http).post(`/routines/exercises/${ex.id}/log`).set('Authorization', `Bearer ${s1.token}`).send({ id: log.body.id, weight: 1 }).expect(201);
      const logs = await request(http).get(`/routines/exercises/${ex.id}/logs`).set('Authorization', `Bearer ${s1.token}`).expect(200);
      expect(logs.body.map((l: { weight: number }) => l.weight).sort()).toEqual([1, 100]);
    });

    it('validates exercise input', async () => {
      const { auth, routine } = await setup();
      const day = await request(http).post(`/routines/coach/${routine.id}/days`).set(auth).send({ name: 'Dia 2' }).expect(201);
      await request(http).post(`/routines/coach/days/${day.body.id}/exercises`).set(auth).send({ name: 'Press', sets: 'cuatro', reps: '10' }).expect(400);
    });
  });
});
