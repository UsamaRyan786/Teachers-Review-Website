import Teacher from '../models/Teacher.js';
import { scrapeTeacherProfile } from './profileScraper.js';
import { downloadTeacherImage } from './imageStorage.js';
import { mergeProfileIntoTeacher } from './profileMerge.js';
import { runProfileSync, getProfileSyncStatus } from './profileSync.js';

export const storeTeacherImage = async (imageUrl, slug) => {
  if (!imageUrl || !slug) return imageUrl || '';
  return downloadTeacherImage(imageUrl, slug);
};

const needsProfileRefresh = (teacher) => {
  if (!teacher.sourceUrl) return false;
  if (!teacher.profileScrapedAt) return true;
  if (teacher.email && !/@ucp\.edu\.pk$/i.test(teacher.email)) return true;
  const ageMs = Date.now() - new Date(teacher.profileScrapedAt).getTime();
  return ageMs > 30 * 24 * 60 * 60 * 1000;
};

export { mergeProfileIntoTeacher } from './profileMerge.js';

export const enrichTeacherProfile = async (teacherDoc) => {
  if (!teacherDoc?.sourceUrl) return teacherDoc;

  const profile = await scrapeTeacherProfile(teacherDoc.sourceUrl);
  if (!profile) {
    await Teacher.findByIdAndUpdate(teacherDoc._id, { profileScrapedAt: new Date() });
    return teacherDoc;
  }

  const updates = mergeProfileIntoTeacher(teacherDoc.toObject ? teacherDoc.toObject() : teacherDoc, profile);
  const storedImageUrl = await downloadTeacherImage(updates.imageUrl, teacherDoc.slug);

  const saved = await Teacher.findByIdAndUpdate(
    teacherDoc._id,
    {
      $set: {
        imageUrl: storedImageUrl,
        email: updates.email,
        extension: updates.extension,
        profileSummary: updates.profileSummary,
        qualifications: updates.qualifications,
        experience: updates.experience,
        publications: updates.publications,
        designation: updates.designation,
        profileScrapedAt: updates.profileScrapedAt,
      },
    },
    { new: true }
  );

  return saved;
};

export const enrichTeacherIfNeeded = async (teacher) => {
  if (!needsProfileRefresh(teacher)) return teacher;
  return enrichTeacherProfile(teacher);
};

export const enrichAllTeacherProfiles = async (options = {}) => {
  const { onProgress, ...syncOptions } = options;

  if (onProgress) {
    const interval = setInterval(() => {
      const status = getProfileSyncStatus();
      if (status.running || status.processed > 0) {
        onProgress({
          current: status.processed,
          total: status.total,
          updated: status.updated,
          failed: status.failed,
          name: status.processed > 0 ? '...' : '',
        });
      }
    }, 500);

    try {
      return await runProfileSync({ ...syncOptions, limit: syncOptions.limit || 0, background: false });
    } finally {
      clearInterval(interval);
    }
  }

  return runProfileSync({ ...syncOptions, limit: syncOptions.limit || 0, background: false });
};
