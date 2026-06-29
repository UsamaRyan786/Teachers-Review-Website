import fetch from 'node-fetch';
const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };
const html = await (await fetch('https://www.numl.edu.pk/campusfaculties/45', { headers })).text();
const patterns = ['facultystaff', 'StaffDetail', 'staffdetail', 'employee', 'teacher', 'Mohammad Raza'];
for (const p of patterns) {
  const i = html.indexOf(p);
  if (i >= 0) console.log(p, '->', html.slice(i, i + 120).replace(/\s+/g, ' '));
}
console.log('facultystaff count', (html.match(/facultystaff/gi) || []).length);
