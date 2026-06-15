import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Teacher from '../models/Teacher.js';
import Review from '../models/Review.js';

const recalculateAll = async () => {
  const teachers = await Teacher.find().select('_id');
  let updated = 0;

  for (const teacher of teachers) {
    const stats = await Review.aggregate([
      { $match: { teacher: teacher._id } },
      {
        $group: {
          _id: '$teacher',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Teacher.findByIdAndUpdate(teacher._id, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        reviewCount: stats[0].reviewCount,
      });
      updated++;
    }
  }

  return updated;
};

const run = async () => {
  try {
    await connectDB();
    const updated = await recalculateAll();
    console.log(`Recalculated ratings for ${updated} teachers.`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
