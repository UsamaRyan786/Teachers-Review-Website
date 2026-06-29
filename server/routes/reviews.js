import express from 'express';
import Review from '../models/Review.js';
import Teacher from '../models/Teacher.js';
import { updateTeacherStats } from './teachers.js';
import { sendReviewNotification } from '../utils/email.js';

const router = express.Router();

router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const reviews = await Review.find({ teacher: req.params.teacherId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { teacherId, studentName, course, rating, comment, wouldRecommend } = req.body;

    if (!teacherId || !studentName || !rating || !comment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const review = await Review.create({
      teacher: teacherId,
      studentName: studentName.trim(),
      course: course?.trim() || '',
      rating: Number(rating),
      comment: comment.trim(),
      wouldRecommend: wouldRecommend !== false,
    });

    await updateTeacherStats(teacherId);

    const emailResult = await sendReviewNotification(teacher, review);

    res.status(201).json({
      ...review.toObject(),
      emailNotification: emailResult,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    await updateTeacherStats(review.teacher);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
