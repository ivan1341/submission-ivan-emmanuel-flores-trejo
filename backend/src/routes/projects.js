import { Router } from 'express'
import { body, param, validationResult } from 'express-validator'
import mongoose from 'mongoose'
import { Project } from '../models/Project.js'
import { Comment } from '../models/Comment.js'
import { User } from '../models/User.js'
import { authenticate } from '../middleware/auth.js'
import { requireRole } from '../middleware/auth.js'

const router = Router()

function canAccessProject(project, user) {
  if (user.role === 'admin') return true
  if (project.clientId && project.clientId.toString() === user._id.toString()) return true
  return false
}

router.get(
  '/',
  authenticate,
  async (req, res) => {
    try {
      const query = req.user.role === 'admin'
        ? {}
        : { clientId: req.user._id }
      const list = await Project.find(query).sort({ updatedAt: -1 }).lean()
      const projects = list.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        description: p.description,
        status: p.status,
        clientId: p.clientId?.toString() ?? undefined,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }))
      res.json(projects)
    } catch (err) {
      res.status(500).json({ message: err.message || 'Failed to list projects' })
    }
  }
)

router.get(
  '/stats',
  authenticate,
  requireRole('admin'),
  async (req, res) => {
    try {
      const [active, completed, onHold] = await Promise.all([
        Project.countDocuments({ status: 'active' }),
        Project.countDocuments({ status: 'completed' }),
        Project.countDocuments({ status: 'on-hold' }),
      ])
      res.json({ active, completed, onHold })
    } catch (err) {
      res.status(500).json({ message: err.message || 'Failed to get stats' })
    }
  }
)

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').optional().trim(),
    body('status').optional().isIn(['active', 'completed', 'on-hold']),
    body('clientId').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0]?.msg || 'Validation failed' })
    }
    const { name, description, status, clientId } = req.body
    try {
      let clientIdObj = null
      if (clientId && mongoose.isValidObjectId(clientId)) {
        clientIdObj = new mongoose.Types.ObjectId(clientId)
      }
      const project = await Project.create({
        name,
        description: description || '',
        status: status || 'active',
        clientId: clientIdObj,
        createdBy: req.user._id,
      })
      res.status(201).json(project.toJSON())
    } catch (err) {
      res.status(500).json({ message: err.message || 'Failed to create project' })
    }
  }
)

router.get(
  '/:id',
  authenticate,
  param('id').isMongoId(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid project id' })
    }
    try {
      const project = await Project.findById(req.params.id).lean()
      if (!project) return res.status(404).json({ message: 'Project not found' })
      const clientIdStr = project.clientId?.toString()
      if (!canAccessProject(project, req.user)) {
        return res.status(403).json({ message: 'Access denied to this project' })
      }
      const comments = await Comment.find({ projectId: project._id })
        .populate('userId', 'email name')
        .sort({ createdAt: 1 })
        .lean()
      const commentsJson = comments.map((c) => ({
        id: c._id.toString(),
        projectId: c.projectId.toString(),
        userId: c.userId._id.toString(),
        content: c.content,
        createdAt: c.createdAt,
        user: c.userId ? { email: c.userId.email, name: c.userId.name } : undefined,
      }))
      res.json({
        id: project._id.toString(),
        name: project.name,
        description: project.description,
        status: project.status,
        clientId: clientIdStr ?? undefined,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        comments: commentsJson,
      })
    } catch (err) {
      res.status(500).json({ message: err.message || 'Failed to get project' })
    }
  }
)

router.patch(
  '/:id',
  authenticate,
  requireRole('admin'),
  [
    param('id').isMongoId(),
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('status').optional().isIn(['active', 'completed', 'on-hold']),
    body('clientId').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0]?.msg || 'Validation failed' })
    }
    try {
      const project = await Project.findById(req.params.id)
      if (!project) return res.status(404).json({ message: 'Project not found' })
      if (req.body.name !== undefined) project.name = req.body.name
      if (req.body.description !== undefined) project.description = req.body.description
      if (req.body.status !== undefined) project.status = req.body.status
      if (req.body.clientId !== undefined) {
        project.clientId = req.body.clientId && mongoose.isValidObjectId(req.body.clientId)
          ? new mongoose.Types.ObjectId(req.body.clientId)
          : null
      }
      await project.save()
      res.json(project.toJSON())
    } catch (err) {
      res.status(500).json({ message: err.message || 'Failed to update project' })
    }
  }
)

router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid project id' })
    }
    try {
      const project = await Project.findByIdAndDelete(req.params.id)
      if (!project) return res.status(404).json({ message: 'Project not found' })
      await Comment.deleteMany({ projectId: project._id })
      res.status(204).send()
    } catch (err) {
      res.status(500).json({ message: err.message || 'Failed to delete project' })
    }
  }
)

router.get(
  '/:id/comments',
  authenticate,
  param('id').isMongoId(),
  async (req, res) => {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })
    if (!canAccessProject(project, req.user)) {
      return res.status(403).json({ message: 'Access denied' })
    }
    const comments = await Comment.find({ projectId: project._id })
      .populate('userId', 'email name')
      .sort({ createdAt: 1 })
      .lean()
    res.json(comments.map((c) => ({
      id: c._id.toString(),
      projectId: c.projectId.toString(),
      userId: c.userId._id.toString(),
      content: c.content,
      createdAt: c.createdAt,
      user: c.userId ? { email: c.userId.email, name: c.userId.name } : undefined,
    })))
  }
)

router.post(
  '/:id/comments',
  authenticate,
  [
    param('id').isMongoId(),
    body('content').trim().notEmpty().withMessage('Content is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0]?.msg || 'Validation failed' })
    }
    try {
      const project = await Project.findById(req.params.id)
      if (!project) return res.status(404).json({ message: 'Project not found' })
      if (!canAccessProject(project, req.user)) {
        return res.status(403).json({ message: 'Access denied' })
      }
      const comment = await Comment.create({
        projectId: project._id,
        userId: req.user._id,
        content: req.body.content.trim(),
      })
      const populated = await Comment.findById(comment._id).populate('userId', 'email name').lean()
      res.status(201).json({
        id: populated._id.toString(),
        projectId: populated.projectId.toString(),
        userId: populated.userId._id.toString(),
        content: populated.content,
        createdAt: populated.createdAt,
        user: populated.userId ? { email: populated.userId.email, name: populated.userId.name } : undefined,
      })
    } catch (err) {
      res.status(500).json({ message: err.message || 'Failed to add comment' })
    }
  }
)

export default router
