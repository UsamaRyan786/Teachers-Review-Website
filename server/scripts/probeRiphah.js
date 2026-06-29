import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};
const html = await (await fetch('https://riphah.edu.pk/faculty/', { headers })).text();
const $ = cheerio.load(html);
$('h3').each((_, e) => console.log('h3:', $(e).text().trim()));
console.log('---');
$('a').slice(0,30).each((_, e) => {
  const t = $(e).text().trim();
  const h = $(e).attr('href');
  if (t.length > 3 && t.length < 50) console.log(t, '->', h);
});
