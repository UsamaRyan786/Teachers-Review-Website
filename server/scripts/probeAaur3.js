import fetch from 'node-fetch';
const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };
const html = await (await fetch('https://www.uaar.edu.pk/index.php/faculty-members/', { headers })).text();
const drMatches = html.match(/Dr\.?\s+[A-Z][a-z]+/g) || [];
console.log('Dr matches', drMatches.length, drMatches.slice(0, 10));
const profMatches = html.match(/Prof\.?\s+[A-Z]/g) || [];
console.log('Prof matches', profMatches.length);
