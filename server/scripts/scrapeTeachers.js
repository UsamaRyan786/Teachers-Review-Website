import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Teacher from '../models/Teacher.js';
import { scrapeAllTeachers } from '../utils/ucpScraper.js';

const listingFields = (teacher) => ({
  name: teacher.name,
  designation: teacher.designation,
  department: teacher.department,
  faculty: teacher.faculty,
  imageUrl: teacher.imageUrl,
  sourceUrl: teacher.sourceUrl,
  slug: teacher.slug,
});

const run = async () => {
  try {
    await connectDB();
    const teachers = await scrapeAllTeachers();

    if (teachers.length === 0) {
      console.error('No teachers scraped. Check your internet connection.');
      process.exit(1);
    }

    let upserted = 0;
    for (const teacher of teachers) {
      await Teacher.findOneAndUpdate(
        { slug: teacher.slug },
        { $set: listingFields(teacher) },
        { upsert: true, setDefaultsOnInsert: true }
      );
      upserted++;
    }

    console.log(`\nDatabase updated: ${upserted} teachers saved.`);
    console.log('Run "npm run scrape:profiles" to import full UCP profile data.');
  } catch (err) {
    console.error('Scrape failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
