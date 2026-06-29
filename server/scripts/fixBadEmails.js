import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Teacher from '../models/Teacher.js';
import { runProfileSync } from '../utils/profileSync.js';

await connectDB();

const badCount = await Teacher.countDocuments({
  $and: [{ email: { $ne: '' } }, { email: { $not: { $regex: /@ucp\.edu\.pk$/i } } }],
});
console.log(`Teachers with non-UCP email: ${badCount}`);

if (badCount === 0) {
  console.log('Nothing to fix.');
  await mongoose.disconnect();
  process.exit(0);
}

console.log('Re-syncing profiles with incorrect emails...\n');
const result = await runProfileSync({ onlyMissing: true, limit: 0, background: false });
console.log(`\nDone. ${result.message}`);

const remaining = await Teacher.countDocuments({
  $and: [{ email: { $ne: '' } }, { email: { $not: { $regex: /@ucp\.edu\.pk$/i } } }],
});
console.log(`Remaining non-UCP emails: ${remaining}`);

await mongoose.disconnect();
