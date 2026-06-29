import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };

const deptUrls = [
  'https://www.uaar.edu.pk/department-of-agronomy/faculty/',
  'https://uaar.edu.pk/faculty-of-agriculture/department-of-agronomy/faculty/',
  'https://www.uaar.edu.pk/index.php/faculty-members/',
];

for (const url of deptUrls) {
  try {
    const res = await fetch(url, { headers });
    console.log(res.status, url, (await res.text()).length);
  } catch (e) {
    console.log('ERR', url, e.message);
  }
}
