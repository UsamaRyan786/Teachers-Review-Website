import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };
const html = await (await fetch('https://www.uaar.edu.pk/index.php/faculty-members/', { headers })).text();
const $ = cheerio.load(html);
console.log('tables', $('table').length);
$('table tr').slice(0,5).each((_, e) => console.log($(e).find('td,th').map((__, c) => $(c).text().trim()).get()));
console.log('member-item', $('.member-item').length);
$('a[href*="member"], a[href*="faculty"]').slice(0,10).each((_, e) => console.log($(e).text().trim().slice(0,40), $(e).attr('href')));
