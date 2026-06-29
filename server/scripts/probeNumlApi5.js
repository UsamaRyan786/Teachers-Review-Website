import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'application/json, text/javascript, */*; q=0.01',
  'X-Requested-With': 'XMLHttpRequest',
};

const pageRes = await fetch('https://www.numl.edu.pk/facultyfinder', { headers });
const cookies = pageRes.headers.raw()['set-cookie']?.map((c) => c.split(';')[0]).join('; ') || '';
const token = cheerio.load(await pageRes.text())('input[name="_token"]').attr('value');

const getJson = async (params) => {
  const qs = new URLSearchParams({ ...params, _token: token });
  const res = await fetch(`https://www.numl.edu.pk/admin/loadFaculties?${qs}`, {
    headers: { ...headers, Cookie: cookies, Referer: 'https://www.numl.edu.pk/facultyfinder' },
  });
  const text = await res.text();
  console.log('params', params, 'status', res.status, 'len', text.length, 'preview', text.slice(0, 120));
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

await getJson({ campusId: '45', facultyId: '', departmentId: '', query1: '' });
await getJson({ campusId: '45', facultyId: '1', departmentId: '', query1: '' });
await getJson({ campusId: '45', facultyId: '5', departmentId: '178', query1: '' });
