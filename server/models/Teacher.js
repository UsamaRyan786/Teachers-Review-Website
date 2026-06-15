import mongoose from 'mongoose';

const qualificationSchema = new mongoose.Schema(
  {
    degree: { type: String, default: '' },
    field: { type: String, default: '' },
    institution: { type: String, default: '' },
    year: { type: String, default: '' },
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    role: { type: String, default: '' },
    organization: { type: String, default: '' },
    period: { type: String, default: '' },
  },
  { _id: false }
);

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, default: 'Faculty Member' },
    department: { type: String, default: 'General' },
    faculty: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    email: { type: String, default: '' },
    extension: { type: String, default: '' },
    profileSummary: { type: String, default: '' },
    qualifications: { type: [qualificationSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    publications: { type: [String], default: [] },
    sourceUrl: { type: String, default: '' },
    slug: { type: String, unique: true, sparse: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    profileScrapedAt: { type: Date },
  },
  { timestamps: true }
);

teacherSchema.index({ name: 'text', department: 'text', faculty: 'text' });

export default mongoose.model('Teacher', teacherSchema);
