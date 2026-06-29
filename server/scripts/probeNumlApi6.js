import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'application/json, text/javascript, */*; q=0.01',
  'X-Requested-With': 'XMLHttpRequest',
};

const pageRes = await fetch('https://www.numl.edu.pk/facultyfinder', { headers });
const cookies = pageRes.headers.raw()['set-cookie']?.map((c) => c.split(';')[0]).join('; ') || '';
const token = cheerio.load(await pageRes.text())('input[name="_token"]').attr('value');

const getJson = async (url, params) => {
  const qs = new URLSearchParams({ ...params, _token: token });
  const res = await fetch(`${url}?${qs}`, {
    headers: { ...headers, Cookie: cookies, Referer: 'https://www.numl.edu.pk/facultyfinder' },
  });
  return res.json();
};

const faculties = await getJson('https://www.numl.edu.pk/admin/loadCampusFaculty', { campusId: '45' });
console.log('faculties', faculties);

for (const fac of faculties.slice(0, 1)) {
  const depts = await getJson('https://www.numl.edu.pk/admin/loadFacultyDepartment', {
    facultyId: String(fac.faculty_id),
  });
  console.log('depts count', depts.length, depts[0]);
}
