import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

const secret = process.env.JWT_SECRET || 'secret'

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' })
  }
  try {
    const decoded = jwt.verify(token, secret)
    User.findById(decoded.userId)
      .then((user) => {
        if (!user) return res.status(401).json({ message: 'User not found' })
        req.user = user
        next()
      })
      .catch(() => res.status(401).json({ message: 'Invalid token' }))
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' })
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }
    next()
  }
}
