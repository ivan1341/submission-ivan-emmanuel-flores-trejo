import 'dotenv/config'
import { connectDB } from './config/db.js'
import app from './app.js'

const PORT = process.env.PORT || 3000

await connectDB()
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`API docs: http://localhost:${PORT}/api/docs`)
})
