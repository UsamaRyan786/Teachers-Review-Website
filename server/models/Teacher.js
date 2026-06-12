import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, default: 'Faculty Member' },
    department: { type: String, default: 'General' },
    faculty: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    slug: { type: String, unique: true, sparse: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

teacherSchema.index({ name: 'text', department: 'text', faculty: 'text' });

export default mongoose.model('Teacher', teacherSchema);
