import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    studentName: { type: String, required: true, trim: true },
    course: { type: String, default: '', trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    wouldRecommend: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reviewSchema.index({ teacher: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);
