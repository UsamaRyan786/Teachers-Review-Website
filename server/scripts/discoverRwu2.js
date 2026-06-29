import fetch from 'node-fetch';
const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };
const slugs = [
  'botany', 'english', 'psychology', 'sociology', 'political-science', 'fine-arts',
  'business-of-administration', 'media-communication-studies', 'chemistry', 'physics',
  'mathematics', 'zoology', 'computer-science', 'economics', 'urdu', 'islamic-studies',
];
const found = [];
for (const s of slugs) {
  const url = `https://www.rwu.edu.pk/department-of-${s}/faculty-resources/`;
  const res = await fetch(url, { headers, method: 'HEAD' });
  if (res.ok) found.push(url);
}
console.log('found', found.length, found);
