export const groupTeachersByDepartment = (teachers) => {
  const groups = new Map();

  for (const teacher of teachers) {
    const key = teacher.department?.trim() || 'General';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(teacher);
  }

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
};

export const groupTeachersByFaculty = (teachers) => {
  const groups = new Map();

  for (const teacher of teachers) {
    const key = teacher.faculty?.trim() || 'Other';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(teacher);
  }

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
};
