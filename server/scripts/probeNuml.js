import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};
const html = await (await fetch('https://www.numl.edu.pk/campusfaculties/45', { headers })).text();
const $ = cheerio.load(html);
console.log('faculty cards', $('.faculty-card, .staff-card, .team-member').length);
$('a[href*="facultystaffdetail"], a[href*="FacultyStaffDetail"]').slice(0,5).each((i,e)=>{
  console.log($(e).text().trim(), $(e).attr('href'));
});
const links = [];
$('a[href]').each((_, e) => {
  const h = $(e).attr('href') || '';
  if (/staff|faculty|detail|member/i.test(h) && h.includes('numl')) links.push(h);
});
console.log('staff links unique', [...new Set(links)].slice(0, 20));
