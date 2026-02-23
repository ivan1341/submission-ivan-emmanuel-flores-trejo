import test from 'node:test'
import assert from 'node:assert'
import request from 'supertest'
import { getTestEnv, closeTestEnv } from './setup.js'

async function registerAndGetToken(app, email, password, role = 'client') {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email, password: password || 'password123', role })
  return res.body.token
}

test.before(async () => {
  await getTestEnv()
})

test.after(async () => {
  await closeTestEnv()
})

test('GET /api/dashboard - unauthenticated returns 401', async () => {
  const { app } = await getTestEnv()
  await request(app).get('/api/dashboard').expect(401)
})

test('GET /api/dashboard - admin returns stats', async () => {
  const { app } = await getTestEnv()
  const token = await registerAndGetToken(app, 'dash-admin@test.com', 'password123', 'admin')
  const res = await request(app)
    .get('/api/dashboard')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
  assert.strictEqual(res.body.role, 'admin')
  assert.ok(res.body.stats)
  assert.ok(typeof res.body.stats.active === 'number')
  assert.ok(typeof res.body.stats.completed === 'number')
  assert.ok(typeof res.body.stats.onHold === 'number')
})

test('GET /api/dashboard - client returns assigned count', async () => {
  const { app } = await getTestEnv()
  const token = await registerAndGetToken(app, 'dash-client@test.com', 'password123', 'client')
  const res = await request(app)
    .get('/api/dashboard')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
  assert.strictEqual(res.body.role, 'client')
  assert.ok(res.body.stats)
  assert.ok(typeof res.body.stats.assigned === 'number')
})
