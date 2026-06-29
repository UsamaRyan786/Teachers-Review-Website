import express from 'express';
import mongoose from 'mongoose';
import Teacher from '../models/Teacher.js';
import Review from '../models/Review.js';
import { syncTeacherListing } from '../utils/ucpSync.js';
import { enrichTeacherIfNeeded } from '../utils/enrichProfiles.js';
import { runProfileSync, getProfileSyncStatus } from '../utils/profileSync.js';

const router = express.Router();

const updateTeacherStats = async (teacherId) => {
  const id = new mongoose.Types.ObjectId(teacherId);

  const stats = await Review.aggregate([
    { $match: { teacher: id } },
    {
      $group: {
        _id: '$teacher',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Teacher.findByIdAndUpdate(id, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount,
    });
  } else {
    await Teacher.findByIdAndUpdate(id, { averageRating: 0, reviewCount: 0 });
  }
};

router.get('/', async (req, res) => {
  try {
    const { search, faculty, department, sort = 'name' } = req.query;
    const filter = {};

    if (search) {
      const term = search.trim();
      const words = term.split(/\s+/).filter(Boolean);
      if (words.length > 1) {
        filter.$and = words.map((word) => ({
          $or: [
            { name: { $regex: word, $options: 'i' } },
            { department: { $regex: word, $options: 'i' } },
            { designation: { $regex: word, $options: 'i' } },
            { faculty: { $regex: word, $options: 'i' } },
          ],
        }));
      } else {
        filter.$or = [
          { name: { $regex: term, $options: 'i' } },
          { department: { $regex: term, $options: 'i' } },
          { designation: { $regex: term, $options: 'i' } },
          { faculty: { $regex: term, $options: 'i' } },
        ];
      }
    }
    if (faculty) filter.faculty = faculty;
    if (department) filter.department = department;

    const sortOptions = {
      name: { name: 1 },
      rating: { averageRating: -1, reviewCount: -1 },
      reviews: { reviewCount: -1 },
    };

    const teachers = await Teacher.find(filter)
      .sort(sortOptions[sort] || sortOptions.name)
      .lean();

    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/suggestions', async (req, res) => {
  try {
    const { q = '', faculty = '', department = '', limit = 8 } = req.query;
    const term = q.trim();
    if (!term) return res.json([]);

    const filter = {
      $or: [
        { name: { $regex: term, $options: 'i' } },
        { department: { $regex: term, $options: 'i' } },
      ],
    };
    if (faculty) filter.faculty = faculty;
    if (department) filter.department = department;

    const teachers = await Teacher.find(filter)
      .select('name department faculty designation averageRating reviewCount slug')
      .sort({ name: 1 })
      .limit(Math.min(Number(limit) || 8, 12))
      .lean();

    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/faculties', async (_req, res) => {
  try {
    const faculties = await Teacher.distinct('faculty');
    res.json(faculties.sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/departments', async (req, res) => {
  try {
    const filter = {};
    if (req.query.faculty) filter.faculty = req.query.faculty;

    const departments = await Teacher.distinct('department', filter);
    res.json(
      departments
        .filter((d) => d && d.trim())
        .sort((a, b) => a.localeCompare(b))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/stats', async (_req, res) => {
  try {
    const [teacherCount, reviewCount, topRated] = await Promise.all([
      Teacher.countDocuments(),
      Review.countDocuments(),
      Teacher.find({ reviewCount: { $gt: 0 } })
        .sort({ averageRating: -1, reviewCount: -1 })
        .limit(5)
        .lean(),
    ]);

    res.json({ teacherCount, reviewCount, topRated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let teacher = null;

    if (/^[a-f\d]{24}$/i.test(id)) {
      teacher = await Teacher.findById(id);
    }

    if (!teacher) {
      teacher = await Teacher.findOne({ slug: id });
    }

    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    teacher = await enrichTeacherIfNeeded(teacher);
    res.json(teacher.toObject());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/scrape', async (_req, res) => {
  try {
    const count = await syncTeacherListing();
    res.json({ message: `Successfully imported ${count} teachers from UCP website`, count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/scrape-profiles', async (req, res) => {
  try {
    const limit = Number(req.body?.limit) || 0;
    const onlyMissing = req.body?.onlyMissing !== false;
    const background = req.body?.background !== false;

    const result = await runProfileSync({
      onlyMissing,
      limit,
      background,
    });

    if (result.alreadyRunning) {
      return res.status(409).json({
        message: 'A profile sync is already running',
        ...getProfileSyncStatus(),
      });
    }

    res.status(background && result.started ? 202 : 200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/scrape-profiles/status', (_req, res) => {
  res.json(getProfileSyncStatus());
});

export { updateTeacherStats };
export default router;
