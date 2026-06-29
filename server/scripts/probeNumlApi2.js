import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'application/json, text/html',
};

const pageHtml = await (await fetch('https://www.numl.edu.pk/facultyfinder', { headers })).text();
const $ = cheerio.load(pageHtml);
const token = $('input[name="_token"]').attr('value') || $('meta[name="csrf-token"]').attr('content');
console.log('token', token?.slice(0, 20));

const postForm = async (url, data) => {
  const body = new URLSearchParams({ ...data, _token: token || '' });
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text.slice(0, 300);
  }
};

const faculties = await postForm('https://www.numl.edu.pk/admin/loadCampusFaculty', { campusId: '45' });
console.log('faculties', Array.isArray(faculties) ? faculties.length : faculties);

if (Array.isArray(faculties) && faculties.length) {
  const facultyId = faculties[0].faculty_id;
  const depts = await postForm('https://www.numl.edu.pk/admin/loadFacultyDepartment', {
    facultyId: String(facultyId),
  });
  console.log('depts sample', Array.isArray(depts) ? depts.slice(0, 3) : depts);

  if (Array.isArray(depts) && depts.length) {
    const staff = await postForm('https://www.numl.edu.pk/admin/loadFaculties', {
      campusId: '45',
      facultyId: String(facultyId),
      departmentId: String(depts[0].department_id || depts[0].id),
      query1: '',
    });
    console.log('staff sample', JSON.stringify(staff)?.slice(0, 500));
  }
}

// all staff for campus with empty filters
const allStaff = await postForm('https://www.numl.edu.pk/admin/loadFaculties', {
  campusId: '45',
  facultyId: '',
  departmentId: '',
  query1: '',
});
console.log('all staff type', typeof allStaff, Array.isArray(allStaff) ? allStaff.length : String(allStaff).slice(0, 200));
