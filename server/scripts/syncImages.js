import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Teacher from '../models/Teacher.js';
import { downloadTeacherImage } from '../utils/imageStorage.js';

const run = async () => {
  try {
    await connectDB();
    const teachers = await Teacher.find({
      slug: { $ne: '' },
      imageUrl: { $regex: /^https?:\/\// },
    }).select('name slug imageUrl');

    console.log(`Downloading ${teachers.length} teacher photos from UCP...\n`);

    let saved = 0;
    let failed = 0;

    for (let i = 0; i < teachers.length; i++) {
      const teacher = teachers[i];
      const localUrl = await downloadTeacherImage(teacher.imageUrl, teacher.slug);

      if (localUrl.startsWith('/uploads/')) {
        await Teacher.findByIdAndUpdate(teacher._id, { imageUrl: localUrl });
        saved++;
      } else {
        failed++;
      }

      if ((i + 1) % 25 === 0 || i + 1 === teachers.length) {
        console.log(`  [${i + 1}/${teachers.length}] saved: ${saved}, failed: ${failed}`);
      }

      await new Promise((r) => setTimeout(r, 150));
    }

    console.log(`\nDone. Local photos saved: ${saved}/${teachers.length}`);
  } catch (err) {
    console.error('Image sync failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
