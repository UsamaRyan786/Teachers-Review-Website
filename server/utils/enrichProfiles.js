import Teacher from '../models/Teacher.js';
import { scrapeTeacherProfile } from './profileScraper.js';
import { downloadTeacherImage } from './imageStorage.js';

export const storeTeacherImage = async (imageUrl, slug) => {
  if (!imageUrl || !slug) return imageUrl || '';
  return downloadTeacherImage(imageUrl, slug);
};

const needsProfileRefresh = (teacher) => {
  if (!teacher.sourceUrl) return false;
  if (!teacher.profileScrapedAt) return true;
  const ageMs = Date.now() - new Date(teacher.profileScrapedAt).getTime();
  return ageMs > 30 * 24 * 60 * 60 * 1000;
};

export const mergeProfileIntoTeacher = (teacher, profile) => {
  if (!profile) return teacher;

  return {
    ...teacher,
    imageUrl: profile.imageUrl || teacher.imageUrl,
    email: profile.email || teacher.email,
    extension: profile.extension || teacher.extension,
    profileSummary: profile.profileSummary || teacher.profileSummary,
    qualifications: profile.qualifications?.length ? profile.qualifications : teacher.qualifications,
    experience: profile.experience?.length ? profile.experience : teacher.experience,
    publications: profile.publications?.length ? profile.publications : teacher.publications,
    designation: profile.designation || teacher.designation,
    profileScrapedAt: new Date(),
  };
};

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

export const enrichAllTeacherProfiles = async ({ limit = 0, delayMs = 350, onProgress } = {}) => {
  const query = { sourceUrl: { $ne: '' } };
  let teachers = await Teacher.find(query).select('_id name slug sourceUrl profileScrapedAt');

  if (limit > 0) teachers = teachers.slice(0, limit);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < teachers.length; i++) {
    const teacher = teachers[i];
    try {
      const profile = await scrapeTeacherProfile(teacher.sourceUrl);
      if (profile) {
        const merged = mergeProfileIntoTeacher(teacher.toObject(), profile);
        const storedImageUrl = await downloadTeacherImage(merged.imageUrl, teacher.slug);
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
        updated++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }

    if (onProgress) onProgress({ current: i + 1, total: teachers.length, updated, failed, name: teacher.name });
    if (delayMs > 0 && i < teachers.length - 1) await new Promise((r) => setTimeout(r, delayMs));
  }

  return { total: teachers.length, updated, failed };
};
