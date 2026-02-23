import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
const secret = process.env.JWT_SECRET || 'secret'
const expiresIn = process.env.JWT_ACCESS_EXPIRATION || '15m'

function issueToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    secret,
    { expiresIn }
  )
}

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').optional().trim(),
    body('role').optional().isIn(['admin', 'client']),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0]?.msg || 'Validation failed', errors: errors.array() })
    }
    const { email, password, name, role } = req.body
    try {
      const existing = await User.findOne({ email })
      if (existing) return res.status(400).json({ message: 'Email already registered' })
      const user = await User.create({
        email,
        password,
        name: name || '',
        role: role || 'client',
      })
      const token = issueToken(user)
      const userJson = user.toJSON()
      return res.status(201).json({ token, user: userJson })
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Registration failed' })
    }
  }
)

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0]?.msg || 'Validation failed' })
    }
    const { email, password } = req.body
    try {
      const user = await User.findOne({ email }).select('+password')
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' })
      }
      const token = issueToken(user)
      const userJson = user.toJSON()
      return res.json({ token, user: userJson })
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Login failed' })
    }
  }
)

router.get('/me', authenticate, (req, res) => {
  res.json(req.user.toJSON())
})

export default router
