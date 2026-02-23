import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['active', 'completed', 'on-hold'], default: 'active' },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

projectSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString()
    ret.clientId = ret.clientId?.toString() ?? null
    ret.createdBy = ret.createdBy?.toString()
    delete ret._id
    delete ret.__v
    return ret
  },
})

export const Project = mongoose.model('Project', projectSchema)
