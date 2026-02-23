import { Router } from 'express'
import { query, validationResult } from 'express-validator'
import { User } from '../models/User.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

// GET /api/users?role=client
router.get(
  '/',
  authenticate,
  requireRole('admin'),
  [
    query('role').optional().isIn(['admin', 'client']),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0]?.msg || 'Validation failed' })
    }

    const role = req.query.role
    const filter = role ? { role } : {}

    try {
      const users = await User.find(filter).select('email name role').sort({ email: 1 }).lean()
      res.json(users.map((u) => ({
        id: u._id.toString(),
        email: u.email,
        name: u.name,
        role: u.role,
      })))
    } catch (err) {
      res.status(500).json({ message: err.message || 'Failed to list users' })
    }
  }
)

export default router

