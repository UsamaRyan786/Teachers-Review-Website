import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { enrichAllTeacherProfiles } from '../utils/enrichProfiles.js';

const run = async () => {
  try {
    await connectDB();
    console.log('Importing full teacher profiles from UCP (this may take several minutes)...\n');

    const result = await enrichAllTeacherProfiles({
      onProgress: ({ current, total, updated, failed, name }) => {
        if (current % 25 === 0 || current === total) {
          console.log(`  [${current}/${total}] updated: ${updated}, failed: ${failed} — latest: ${name}`);
        }
      },
    });

    console.log(`\nDone. Profiles synced: ${result.updated}/${result.total} (${result.failed} failed).`);
  } catch (err) {
    console.error('Profile scrape failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
