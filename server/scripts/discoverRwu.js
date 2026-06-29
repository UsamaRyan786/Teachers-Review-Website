import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };
const html = await (await fetch('https://www.rwu.edu.pk/', { headers })).text();
const links = [...new Set(
  [...html.matchAll(/https:\/\/www\.rwu\.edu\.pk\/department-of-[a-z0-9-]+\/faculty-resources\/?/gi)].map((m) => m[0])
)];
console.log('faculty-resources links', links.length);
links.forEach((l) => console.log(l));
