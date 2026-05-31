const request = require('supertest');
const app = require('../src/index');
const pool = require('../src/db');

beforeAll(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS releases (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      release_date TIMESTAMPTZ NOT NULL,
      additional_info TEXT,
      completed_steps TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query('TRUNCATE releases RESTART IDENTITY');
});

afterAll(async () => {
  await pool.query('TRUNCATE releases RESTART IDENTITY');
  await pool.end();
});

let createdId;

test('GET /api/health returns ok', async () => {
  const res = await request(app).get('/api/health');
  expect(res.statusCode).toBe(200);
  expect(res.body.ok).toBe(true);
});

test('POST /api/releases creates a release', async () => {
  const res = await request(app).post('/api/releases').send({
    name: 'v1.0.0',
    release_date: '2024-12-01T10:00:00Z',
    additional_info: 'First release',
  });
  expect(res.statusCode).toBe(201);
  expect(res.body.name).toBe('v1.0.0');
  expect(res.body.status).toBe('planned');
  createdId = res.body.id;
});

test('GET /api/releases returns list', async () => {
  const res = await request(app).get('/api/releases');
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBeGreaterThan(0);
});

test('PATCH /api/releases/:id/steps marks step completed', async () => {
  const res = await request(app)
    .patch(`/api/releases/${createdId}/steps`)
    .send({ step_id: 'code_freeze', completed: true });
  expect(res.statusCode).toBe(200);
  expect(res.body.completed_steps).toContain('code_freeze');
  expect(res.body.status).toBe('ongoing');
});

test('PATCH /api/releases/:id updates additional_info', async () => {
  const res = await request(app)
    .patch(`/api/releases/${createdId}`)
    .send({ additional_info: 'Updated info' });
  expect(res.statusCode).toBe(200);
  expect(res.body.additional_info).toBe('Updated info');
});

test('DELETE /api/releases/:id deletes release', async () => {
  const res = await request(app).delete(`/api/releases/${createdId}`);
  expect(res.statusCode).toBe(200);
  expect(res.body.deleted).toBe(true);
});
