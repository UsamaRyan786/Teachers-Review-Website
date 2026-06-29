import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };
const html = await (await fetch('https://www.numl.edu.pk/departments/178', { headers })).text();
const $ = cheerio.load(html);
console.log('title', $('title').text());
$('a[href*="facultystaff"], a[href*="staffdetail"], a[href*="Staff"]').slice(0,10).each((_,e)=>{
  console.log($(e).text().trim(), $(e).attr('href'));
});
// look for faculty cards
$('.faculty-member, .staff-member, .team-block, .profile').length;
$('h3, h4, h5').slice(0,20).each((_,e)=>console.log($(e).prop('tagName'), $(e).text().trim().slice(0,60)));
const staffLinks = [];
$('a[href]').each((_, e) => {
  const h = $(e).attr('href') || '';
  if (/facultystaff|staffprofile|memberprofile|\/staff\//i.test(h)) staffLinks.push(h);
});
console.log('staff links', [...new Set(staffLinks)].slice(0, 15));
