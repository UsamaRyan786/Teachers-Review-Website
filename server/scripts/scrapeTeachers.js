import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Teacher from '../models/Teacher.js';
import { syncTeacherListing } from '../utils/ucpSync.js';

const run = async () => {
  try {
    await connectDB();
    const count = await syncTeacherListing();
    console.log(`\nDatabase updated: ${count} UCP teachers saved.`);
    console.log('Run "npm run scrape:profiles" to import full UCP profile data.');
  } catch (err) {
    console.error('Scrape failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
