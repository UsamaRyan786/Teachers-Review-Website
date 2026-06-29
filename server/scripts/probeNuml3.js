import fetch from 'node-fetch';
const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };

const tryUrl = async (url) => {
  const res = await fetch(url, { headers });
  const text = await res.text();
  console.log(res.status, url, text.slice(0, 200).replace(/\s+/g, ' '));
};

await tryUrl('https://www.numl.edu.pk/api/campusfaculties/45');
await tryUrl('https://www.numl.edu.pk/CampusFaculties/GetFacultyStaff/45');
await tryUrl('https://www.numl.edu.pk/Home/GetFacultyByCampus?campusId=45');
await tryUrl('https://www.numl.edu.pk/facultystaffdetail/1');

// scrape campus page for staff links
import * as cheerio from 'cheerio';
const html = await (await fetch('https://www.numl.edu.pk/campusfaculties/45', { headers })).text();
const $ = cheerio.load(html);
const scripts = $('script').map((_, e) => $(e).html() || '').get().join('\n');
const urls = [...scripts.matchAll(/https?:[^'"]+|\/[A-Za-z]+\/[A-Za-z]+/g)].map((m) => m[0]).filter((u) => /faculty|staff|campus/i.test(u));
console.log('script urls', [...new Set(urls)].slice(0, 25));
