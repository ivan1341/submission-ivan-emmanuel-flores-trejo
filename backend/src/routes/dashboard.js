import { Router } from 'express'
import { Project } from '../models/Project.js'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const [active, completed, onHold] = await Promise.all([
        Project.countDocuments({ status: 'active' }),
        Project.countDocuments({ status: 'completed' }),
        Project.countDocuments({ status: 'on-hold' }),
      ])
      return res.json({ role: 'admin', stats: { active, completed, onHold } })
    }
    const assigned = await Project.countDocuments({ clientId: req.user._id })
    return res.json({ role: 'client', stats: { assigned } })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to get dashboard' })
  }
})

export default router
