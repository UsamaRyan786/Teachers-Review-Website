import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };
const html = await (await fetch('https://www.numl.edu.pk/campusfaculties/45', { headers })).text();
const $ = cheerio.load(html);
console.log('h4 headings:', $('h4').map((_, e) => $(e).text().trim()).get().slice(0, 15));
console.log('links with detail:', $('a[href*="detail"], a[href*="Detail"], a[href*="staff"]').map((_, e) => ({ t: $(e).text().trim().slice(0,40), h: $(e).attr('href') })).get().slice(0, 15));
// faculty list sections
$('.faculty-list, .staff-list, .member, .card').length;
$('li a').each((_, e) => {
  const t = $(e).text().trim();
  const h = $(e).attr('href') || '';
  if (/^[A-Z]/.test(t) && t.includes(' ') && t.length < 50 && !t.includes('Faculty')) {
    console.log('name link:', t, h);
  }
});
