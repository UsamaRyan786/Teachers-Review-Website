import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};
const html = await (await fetch('https://www.numl.edu.pk/facultyfinder', { headers })).text();
const $ = cheerio.load(html);
console.log('title', $('title').text());
$('select option').slice(0, 20).each((_, e) => console.log($(e).attr('value'), $(e).text().trim()));
console.log('---');
const rawMatch = html.match(/rawalpindi/gi);
console.log('rawalpindi mentions', rawMatch?.length);
console.log('sample api', html.includes('api') || html.includes('ajax'));
