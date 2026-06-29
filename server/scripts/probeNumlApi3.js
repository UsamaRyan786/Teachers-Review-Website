import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'application/json, text/html, */*',
  'X-Requested-With': 'XMLHttpRequest',
};

const pageRes = await fetch('https://www.numl.edu.pk/facultyfinder', { headers });
const cookies = pageRes.headers.raw()['set-cookie']?.map((c) => c.split(';')[0]).join('; ') || '';
const pageHtml = await pageRes.text();
const $ = cheerio.load(pageHtml);
const token = $('input[name="_token"]').attr('value');
console.log('cookies', cookies.slice(0, 80), 'token', token);

const postForm = async (url, data) => {
  const body = new URLSearchParams({ ...data, _token: token });
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookies,
      Referer: 'https://www.numl.edu.pk/facultyfinder',
    },
    body,
  });
  const text = await res.text();
  console.log(url, res.status, text.slice(0, 400));
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

await postForm('https://www.numl.edu.pk/admin/loadCampusFaculty', { campusId: '45' });
