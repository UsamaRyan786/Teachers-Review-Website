import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Teacher from '../models/Teacher.js';

await connectDB();

const result = await Teacher.deleteMany({
  $or: [
    { university: { $in: ['RMU', 'RWU', 'NUML'] } },
    { faculty: 'Rawalpindi Medical University' },
    { faculty: 'Rawalpindi Women University' },
  ],
});

console.log(`Removed ${result.deletedCount} non-UCP teachers`);

await Teacher.updateMany({}, { $unset: { university: '', city: '' } });

try {
  await Teacher.collection.dropIndex('university_1_slug_1');
} catch {
  /* ok */
}

await Teacher.syncIndexes().catch(() => {});

console.log(`UCP teachers remaining: ${await Teacher.countDocuments()}`);

await mongoose.disconnect();
