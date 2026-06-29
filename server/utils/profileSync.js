import Teacher from '../models/Teacher.js';
import { scrapeTeacherProfile } from './profileScraper.js';
import { downloadTeacherImage, isLocalImage } from './imageStorage.js';
import { mergeProfileIntoTeacher } from './profileMerge.js';

const DEFAULT_CONCURRENCY = Number(process.env.SYNC_CONCURRENCY) || 8;

const createState = () => ({
  running: false,
  startedAt: null,
  finishedAt: null,
  total: 0,
  processed: 0,
  updated: 0,
  failed: 0,
  remaining: 0,
  message: '',
  error: null,
});

let syncState = createState();

const buildFilter = ({ onlyMissing = true, refreshStale = false } = {}) => {
  const filter = { sourceUrl: { $ne: '' } };

  if (onlyMissing && !refreshStale) {
    filter.profileScrapedAt = { $exists: false };
  } else if (refreshStale) {
    const staleBefore = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    filter.$or = [{ profileScrapedAt: { $exists: false } }, { profileScrapedAt: { $lt: staleBefore } }];
  }

  return filter;
};

const syncOneTeacher = async (teacher) => {
  try {
    const profile = await scrapeTeacherProfile(teacher.sourceUrl);

    if (!profile) {
      await Teacher.findByIdAndUpdate(teacher._id, { profileScrapedAt: new Date() });
      return { updated: false };
    }

    const merged = mergeProfileIntoTeacher(teacher.toObject(), profile);
    const storedImageUrl = isLocalImage(teacher.imageUrl)
      ? teacher.imageUrl
      : await downloadTeacherImage(merged.imageUrl || teacher.imageUrl, teacher.slug);

    await Teacher.findByIdAndUpdate(teacher._id, {
      $set: {
        imageUrl: storedImageUrl,
        email: merged.email,
        extension: merged.extension,
        profileSummary: merged.profileSummary,
        qualifications: merged.qualifications,
        experience: merged.experience,
        publications: merged.publications,
        designation: merged.designation,
        profileScrapedAt: merged.profileScrapedAt,
      },
    });

    return { updated: true };
  } catch {
    return { updated: false };
  }
};

const runConcurrent = async (teachers, concurrency, onItem) => {
  let index = 0;

  const worker = async () => {
    while (index < teachers.length) {
      const current = index;
      index += 1;
      await onItem(teachers[current], current);
    }
  };

  const workers = Math.min(Math.max(concurrency, 1), teachers.length || 1);
  await Promise.all(Array.from({ length: workers }, worker));
};

export const getProfileSyncStatus = () => ({ ...syncState });

export const runProfileSync = async ({
  onlyMissing = true,
  refreshStale = false,
  limit = 0,
  concurrency = DEFAULT_CONCURRENCY,
  background = false,
} = {}) => {
  if (syncState.running) {
    return { alreadyRunning: true, ...syncState };
  }

  const filter = buildFilter({ onlyMissing, refreshStale });
  const pending = await Teacher.countDocuments(filter);

  if (pending === 0) {
    const message = 'All teacher profiles are already synced from UCP';
    syncState = { ...createState(), message, remaining: 0 };
    return { message, total: 0, updated: 0, failed: 0, remaining: 0, running: false };
  }

  const batchSize = limit > 0 ? Math.min(limit, pending) : pending;
  const teachers = await Teacher.find(filter).select('_id name slug sourceUrl imageUrl profileScrapedAt').limit(batchSize);

  syncState = {
    ...createState(),
    running: true,
    startedAt: new Date().toISOString(),
    total: teachers.length,
    remaining: pending,
    message: `Syncing ${teachers.length} teacher profiles...`,
  };

  const execute = async () => {
    let updated = 0;
    let failed = 0;

    try {
      await runConcurrent(teachers, concurrency, async (teacher) => {
        const result = await syncOneTeacher(teacher);
        if (result.updated) updated += 1;
        else failed += 1;

        syncState.processed += 1;
        syncState.updated = updated;
        syncState.failed = failed;
      });

      const remaining = await Teacher.countDocuments(buildFilter({ onlyMissing: true, refreshStale: false }));
      syncState.remaining = remaining;
      syncState.message = `Synced ${updated} teacher profiles from UCP (${remaining} remaining)`;
    } catch (err) {
      syncState.error = err.message;
      syncState.message = `Profile sync failed: ${err.message}`;
    } finally {
      syncState.running = false;
      syncState.finishedAt = new Date().toISOString();
    }

    return {
      message: syncState.message,
      total: teachers.length,
      updated,
      failed,
      remaining: syncState.remaining,
      running: false,
    };
  };

  if (background) {
    execute().catch((err) => {
      syncState.error = err.message;
      syncState.running = false;
      syncState.message = `Profile sync failed: ${err.message}`;
    });

    return {
      started: true,
      running: true,
      total: teachers.length,
      remaining: pending,
      message: `Started syncing ${teachers.length} profiles in the background`,
    };
  }

  return execute();
};
