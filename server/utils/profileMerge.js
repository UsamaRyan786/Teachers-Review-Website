const isUcpEmail = (email) => Boolean(email && /@ucp\.edu\.pk$/i.test(email));

const pickEmail = (teacherEmail, profileEmail) => {
  if (isUcpEmail(profileEmail)) return profileEmail;
  if (isUcpEmail(teacherEmail)) return teacherEmail;
  return profileEmail || teacherEmail || '';
};

export const mergeProfileIntoTeacher = (teacher, profile) => {
  if (!profile) return teacher;

  return {
    ...teacher,
    imageUrl: profile.imageUrl || teacher.imageUrl,
    email: pickEmail(teacher.email, profile.email),
    extension: profile.extension || teacher.extension,
    profileSummary: profile.profileSummary || teacher.profileSummary,
    qualifications: profile.qualifications?.length ? profile.qualifications : teacher.qualifications,
    experience: profile.experience?.length ? profile.experience : teacher.experience,
    publications: profile.publications?.length ? profile.publications : teacher.publications,
    designation: profile.designation || teacher.designation,
    profileScrapedAt: new Date(),
  };
};
