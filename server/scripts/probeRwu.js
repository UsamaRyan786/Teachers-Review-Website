import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html',
};

const r = await fetch('https://www.rwu.edu.pk/department-of-botany/faculty-resources/', { headers });
const html = await r.text();
const $ = cheerio.load(html);
console.log('title:', $('title').text());
console.log('h4 sample:', $('h4').slice(0, 10).map((_, e) => $(e).text().trim()).get());
console.log('h5 sample:', $('h5').slice(0, 10).map((_, e) => $(e).text().trim()).get());
console.log('strong with Dr:', $('strong, b').filter((_, e) => /dr\.|prof/i.test($(e).text())).slice(0, 15).map((_, e) => $(e).text().trim()).get());
console.log('wp-block sample:', $('.wp-block-heading').slice(0, 15).map((_, e) => $(e).text().trim()).get());
console.log('contains Sana Jamshaid:', html.includes('Sana Jamshaid'));
