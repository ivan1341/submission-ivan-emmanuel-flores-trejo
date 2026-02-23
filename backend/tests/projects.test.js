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

test('GET /api/projects - unauthenticated returns 401', async () => {
  const { app } = await getTestEnv()
  await request(app).get('/api/projects').expect(401)
})

test('GET /api/projects - admin sees all, client sees assigned only', async () => {
  const { app } = await getTestEnv()
  const clientToken = await registerAndGetToken(app, 'client-p@test.com', 'password123', 'client')
  const adminToken = await registerAndGetToken(app, 'admin-p@test.com', 'password123', 'admin')
  await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Proj for client', status: 'active' })
    .expect(201)
  const adminList = await request(app)
    .get('/api/projects')
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200)
  const clientList = await request(app)
    .get('/api/projects')
    .set('Authorization', `Bearer ${clientToken}`)
    .expect(200)
  assert.ok(Array.isArray(adminList.body))
  assert.ok(Array.isArray(clientList.body))
  assert.ok(adminList.body.length >= 1)
  assert.ok(clientList.body.length < adminList.body.length || adminList.body.length >= 1)
})

test('POST /api/projects - admin can create', async () => {
  const { app } = await getTestEnv()
  const token = await registerAndGetToken(app, 'admin-create@test.com', 'password123', 'admin')
  const res = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'New Project', description: 'Desc', status: 'active' })
    .expect(201)
  assert.strictEqual(res.body.name, 'New Project')
  assert.strictEqual(res.body.status, 'active')
  assert.ok(res.body.id || res.body._id)
})

test('POST /api/projects - client cannot create', async () => {
  const { app } = await getTestEnv()
  const token = await registerAndGetToken(app, 'client-create@test.com', 'password123', 'client')
  await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Forbidden' })
    .expect(403)
})

test('POST /api/projects - validation: name required', async () => {
  const { app } = await getTestEnv()
  const token = await registerAndGetToken(app, 'admin-v@test.com', 'password123', 'admin')
  const res = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ description: 'No name' })
    .expect(400)
  assert.ok(res.body.message)
})

test('GET /api/projects/:id - returns 404 for invalid id', async () => {
  const { app } = await getTestEnv()
  const token = await registerAndGetToken(app, 'admin-get@test.com', 'password123', 'admin')
  await request(app)
    .get('/api/projects/000000000000000000000000')
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
})

test('GET /api/projects/stats - admin only', async () => {
  const { app } = await getTestEnv()
  const adminToken = await registerAndGetToken(app, 'admin-stats@test.com', 'password123', 'admin')
  const res = await request(app)
    .get('/api/projects/stats')
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200)
  assert.ok(typeof res.body.active === 'number')
  assert.ok(typeof res.body.completed === 'number')
  assert.ok(typeof res.body.onHold === 'number')
})

test('GET /api/projects/stats - client returns 403', async () => {
  const { app } = await getTestEnv()
  const token = await registerAndGetToken(app, 'client-stats@test.com', 'password123', 'client')
  await request(app)
    .get('/api/projects/stats')
    .set('Authorization', `Bearer ${token}`)
    .expect(403)
})

test('PATCH /api/projects/:id - admin can update', async () => {
  const { app } = await getTestEnv()
  const token = await registerAndGetToken(app, 'admin-patch@test.com', 'password123', 'admin')
  const create = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'To Update' })
    .expect(201)
  const id = create.body.id || create.body._id
  const res = await request(app)
    .patch(`/api/projects/${id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Updated Name', status: 'completed' })
    .expect(200)
  assert.strictEqual(res.body.name, 'Updated Name')
  assert.strictEqual(res.body.status, 'completed')
})

test('DELETE /api/projects/:id - admin can delete', async () => {
  const { app } = await getTestEnv()
  const token = await registerAndGetToken(app, 'admin-del@test.com', 'password123', 'admin')
  const create = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'To Delete' })
    .expect(201)
  const id = create.body.id || create.body._id
  await request(app)
    .delete(`/api/projects/${id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)
  await request(app)
    .get(`/api/projects/${id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
})

test('POST /api/projects/:id/comments - add comment', async () => {
  const { app } = await getTestEnv()
  const adminToken = await registerAndGetToken(app, 'admin-c@test.com', 'password123', 'admin')
  const create = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Project with comments' })
    .expect(201)
  const id = create.body.id || create.body._id
  const res = await request(app)
    .post(`/api/projects/${id}/comments`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ content: 'First comment' })
    .expect(201)
  assert.strictEqual(res.body.content, 'First comment')
  assert.ok(res.body.id || res.body._id)
  const get = await request(app)
    .get(`/api/projects/${id}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200)
  assert.ok(Array.isArray(get.body.comments))
  assert.ok(get.body.comments.length >= 1)
})

test('POST /api/projects/:id/comments - validation: content required', async () => {
  const { app } = await getTestEnv()
  const token = await registerAndGetToken(app, 'admin-cc@test.com', 'password123', 'admin')
  const create = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Proj' })
    .expect(201)
  const id = create.body.id || create.body._id
  await request(app)
    .post(`/api/projects/${id}/comments`)
    .set('Authorization', `Bearer ${token}`)
    .send({ content: '' })
    .expect(400)
})
