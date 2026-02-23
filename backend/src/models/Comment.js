import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true }
)

commentSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString()
    ret.projectId = ret.projectId?.toString()
    ret.userId = ret.userId?.toString()
    delete ret._id
    delete ret.__v
    return ret
  },
})

export const Comment = mongoose.model('Comment', commentSchema)
