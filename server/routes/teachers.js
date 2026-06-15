import express from 'express';
import Teacher from '../models/Teacher.js';
import Review from '../models/Review.js';
import { scrapeAllTeachers } from '../utils/ucpScraper.js';
import { enrichTeacherIfNeeded } from '../utils/enrichProfiles.js';
import { downloadTeacherImage } from '../utils/imageStorage.js';

const router = express.Router();

const listingFields = (teacher) => {
  const fields = {
    name: teacher.name,
    designation: teacher.designation,
    department: teacher.department,
    faculty: teacher.faculty,
    sourceUrl: teacher.sourceUrl,
    slug: teacher.slug,
  };
  if (teacher.imageUrl) fields.imageUrl = teacher.imageUrl;
  return fields;
};

const upsertTeacherListing = async (teacher) => {
  const storedImageUrl = teacher.imageUrl
    ? await downloadTeacherImage(teacher.imageUrl, teacher.slug)
    : '';

  await Teacher.findOneAndUpdate(
    { slug: teacher.slug },
    { $set: { ...listingFields(teacher), ...(storedImageUrl ? { imageUrl: storedImageUrl } : {}) } },
    { upsert: true, setDefaultsOnInsert: true }
  );
};

const updateTeacherStats = async (teacherId) => {
  const stats = await Review.aggregate([
    { $match: { teacher: teacherId } },
    {
      $group: {
        _id: '$teacher',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Teacher.findByIdAndUpdate(teacherId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount,
    });
  } else {
    await Teacher.findByIdAndUpdate(teacherId, { averageRating: 0, reviewCount: 0 });
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
    const scraped = await scrapeAllTeachers();
    let count = 0;

    for (const teacher of scraped) {
      await upsertTeacherListing(teacher);
      count++;
    }

    res.json({ message: `Successfully imported ${count} teachers from UCP website`, count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/scrape-profiles', async (req, res) => {
  try {
    const limit = Number(req.body?.limit) || 0;
    const onlyMissing = req.body?.onlyMissing !== false;

    const filter = { sourceUrl: { $ne: '' } };
    if (onlyMissing) filter.profileScrapedAt = { $exists: false };

    const pending = await Teacher.countDocuments(filter);
    if (pending === 0) {
      return res.json({ message: 'All teacher profiles are already synced from UCP', total: 0, updated: 0, failed: 0 });
    }

    const batchSize = limit > 0 ? limit : Math.min(pending, 25);
    const teachers = await Teacher.find(filter).limit(batchSize);

    let updated = 0;
    let failed = 0;

    for (const teacher of teachers) {
      try {
        const enriched = await enrichTeacherIfNeeded(teacher);
        if (enriched?.profileScrapedAt) updated++;
        else failed++;
        await new Promise((r) => setTimeout(r, 300));
      } catch {
        failed++;
      }
    }

    const remaining = await Teacher.countDocuments({
      sourceUrl: { $ne: '' },
      profileScrapedAt: { $exists: false },
    });

    res.json({
      message: `Synced ${updated} teacher profiles from UCP (${remaining} remaining)`,
      total: teachers.length,
      updated,
      failed,
      remaining,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export { updateTeacherStats };
export default router;
