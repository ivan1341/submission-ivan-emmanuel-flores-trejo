import test from 'node:test'
import assert from 'node:assert'
import request from 'supertest'
import { getTestEnv, closeTestEnv } from './setup.js'

test.before(async () => {
  await getTestEnv()
})

test.after(async () => {
  await closeTestEnv()
})

test('POST /api/auth/register - success', async () => {
  const { app } = await getTestEnv()
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'user1@test.com', password: 'password123', name: 'User One' })
    .expect(201)
  assert.ok(res.body.token)
  assert.strictEqual(res.body.user.email, 'user1@test.com')
  assert.strictEqual(res.body.user.role, 'client')
  assert.ok(res.body.user.id || res.body.user._id)
})

test('POST /api/auth/register - with role admin', async () => {
  const { app } = await getTestEnv()
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'admin@test.com', password: 'admin123', role: 'admin' })
    .expect(201)
  assert.ok(res.body.token)
  assert.strictEqual(res.body.user.role, 'admin')
})

test('POST /api/auth/register - validation: short password', async () => {
  const { app } = await getTestEnv()
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'x@test.com', password: '12345' })
    .expect(400)
  assert.ok(res.body.message)
})

test('POST /api/auth/register - validation: invalid email', async () => {
  const { app } = await getTestEnv()
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'not-an-email', password: 'password123' })
    .expect(400)
  assert.ok(res.body.message)
})

test('POST /api/auth/register - duplicate email', async () => {
  const { app } = await getTestEnv()
  await request(app)
    .post('/api/auth/register')
    .send({ email: 'dup@test.com', password: 'password123' })
    .expect(201)
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'dup@test.com', password: 'other123' })
    .expect(400)
  assert.ok(res.body.message?.toLowerCase().includes('email') || res.body.message?.toLowerCase().includes('already'))
})

test('POST /api/auth/login - success', async () => {
  const { app } = await getTestEnv()
  await request(app)
    .post('/api/auth/register')
    .send({ email: 'login@test.com', password: 'secret123' })
    .expect(201)
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'login@test.com', password: 'secret123' })
    .expect(200)
  assert.ok(res.body.token)
  assert.strictEqual(res.body.user.email, 'login@test.com')
})

test('POST /api/auth/login - wrong password', async () => {
  const { app } = await getTestEnv()
  await request(app)
    .post('/api/auth/register')
    .send({ email: 'wrongpw@test.com', password: 'correct123' })
    .expect(201)
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'wrongpw@test.com', password: 'wrong' })
    .expect(401)
  assert.ok(res.body.message)
})

test('POST /api/auth/login - user not found', async () => {
  const { app } = await getTestEnv()
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'nonexistent@test.com', password: 'any' })
    .expect(401)
  assert.ok(res.body.message)
})

test('GET /api/auth/me - without token returns 401', async () => {
  const { app } = await getTestEnv()
  await request(app).get('/api/auth/me').expect(401)
})

test('GET /api/auth/me - with valid token returns user', async () => {
  const { app } = await getTestEnv()
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ email: 'me@test.com', password: 'pass123' })
    .expect(201)
  const res = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${reg.body.token}`)
    .expect(200)
  assert.strictEqual(res.body.email, 'me@test.com')
})
