import 'dotenv/config'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongod
let app

export async function getTestEnv() {
  if (app) return { app, mongoose }
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'
  process.env.JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '15m'
  mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri()
  await mongoose.connect(process.env.MONGODB_URI)
  const { default: appModule } = await import('../src/app.js')
  app = appModule
  return { app, mongoose }
}

export async function closeTestEnv() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect()
  if (mongod) await mongod.stop()
  app = null
}
