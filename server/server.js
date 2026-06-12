import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import teacherRoutes from './routes/teachers.js';
import reviewRoutes from './routes/reviews.js';
import Teacher from './models/Teacher.js';
import { scrapeAllTeachers } from './utils/ucpScraper.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'UCP Teacher Reviews API' });
});

app.use('/api/teachers', teacherRoutes);
app.use('/api/reviews', reviewRoutes);

const seedIfEmpty = async () => {
  const count = await Teacher.countDocuments();
  if (count > 0) {
    console.log(`Database has ${count} teachers`);
    return;
  }

  console.log('No teachers found — scraping UCP website...');
  const teachers = await scrapeAllTeachers();

  if (teachers.length > 0) {
    await Teacher.insertMany(teachers, { ordered: false }).catch(() => {});
    console.log(`Seeded ${teachers.length} teachers from UCP`);
  }
};

const start = async () => {
  try {
    await connectDB();
    await seedIfEmpty();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
