import Teacher from '../models/Teacher.js';
import { scrapeAllTeachers } from './ucpScraper.js';
import { downloadTeacherImage } from './imageStorage.js';
import { runProfileSync } from './profileSync.js';

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

export const upsertTeacherListing = async (teacher) => {
  const storedImageUrl = teacher.imageUrl
    ? await downloadTeacherImage(teacher.imageUrl, teacher.slug)
    : '';

  await Teacher.findOneAndUpdate(
    { slug: teacher.slug },
    { $set: { ...listingFields(teacher), ...(storedImageUrl ? { imageUrl: storedImageUrl } : {}) } },
    { upsert: true, setDefaultsOnInsert: true }
  );
};

export const syncTeacherListing = async () => {
  const scraped = await scrapeAllTeachers();
  let count = 0;

  for (const teacher of scraped) {
    await upsertTeacherListing(teacher);
    count += 1;
  }

  return count;
};

export const runDailySync = async () => {
  console.log('[scheduler] Refreshing teacher listing from UCP...');
  const listingCount = await syncTeacherListing();
  console.log(`[scheduler] Listing updated for ${listingCount} teachers`);

  console.log('[scheduler] Syncing teacher profiles (missing + stale)...');
  const profileResult = await runProfileSync({
    onlyMissing: false,
    refreshStale: true,
    limit: 0,
    background: false,
  });

  console.log(`[scheduler] ${profileResult.message}`);
  return { listingCount, profileResult };
};
