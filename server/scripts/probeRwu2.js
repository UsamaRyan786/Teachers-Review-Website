import fetch from 'node-fetch';
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};
const html = await (await fetch('https://www.rwu.edu.pk/department-of-botany/faculty-resources/', { headers })).text();
const idx = html.indexOf('Sana Jamshaid');
console.log(html.slice(Math.max(0, idx - 200), idx + 200));
