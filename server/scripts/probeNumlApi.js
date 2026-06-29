import fetch from 'node-fetch';
import fs from 'fs';
const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };
const html = await (await fetch('https://www.numl.edu.pk/facultyfinder', { headers })).text();
fs.writeFileSync('numl-finder.html', html);
console.log('saved', html.length);

// try common ajax endpoints
const posts = [
  ['https://www.numl.edu.pk/FacultyFinder/GetFaculty', { campusId: 45 }],
  ['https://www.numl.edu.pk/facultyfinder/getfaculty', { campus: 45 }],
  ['https://www.numl.edu.pk/Home/GetDepartmentFaculty', { campusId: 45, departmentId: 178 }],
];
for (const [url, body] of posts) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const t = await res.text();
    console.log(res.status, url, t.slice(0, 150));
  } catch (e) {
    console.log('ERR', url, e.message);
  }
}
