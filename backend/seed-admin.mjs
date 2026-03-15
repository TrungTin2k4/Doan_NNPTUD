import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import process from 'node:process'

process.loadEnvFile?.('.env.local')

const mongoUri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB

if (!mongoUri) {
  throw new Error('MONGODB_URI is required')
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    enrolledCourseIds: { type: [String], default: [] },
    enabled: { type: Boolean, default: true },
    tokenVersion: { type: Number, default: 0 },
  },
  {
    collection: 'users',
    timestamps: true,
    versionKey: false,
  },
)

const User = mongoose.models.User ?? mongoose.model('User', userSchema)

const adminEmail = 'admin@edulearn.local'
const adminPassword = 'Admin@123456'

await mongoose.connect(mongoUri, { dbName })

const passwordHash = await bcrypt.hash(adminPassword, 10)

await User.updateOne(
  { email: adminEmail },
  {
    $set: {
      email: adminEmail,
      password: passwordHash,
      fullName: 'EduLearn Admin',
      role: 'ADMIN',
      enabled: true,
    },
    $setOnInsert: {
      enrolledCourseIds: [],
      tokenVersion: 0,
      phone: null,
      avatarUrl: null,
    },
  },
  { upsert: true },
)

console.log('Admin account ready')
console.log(`email=${adminEmail}`)
console.log(`password=${adminPassword}`)

await mongoose.disconnect()
