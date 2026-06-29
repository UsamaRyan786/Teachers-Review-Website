import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

const resolveImageUrl = (raw) => {
  if (!raw || raw.startsWith('data:')) return '';
  if (raw.startsWith('http')) return raw;
  return `https://ucp.edu.pk${raw.startsWith('/') ? '' : '/'}${raw}`;
};

const extractImage = ($) => {
  const img = $('.member-item img, img.wp-post-image').first();
  const raw =
    img.attr('data-lazy-src') ||
    img.attr('data-src') ||
    img.attr('src') ||
    $('.member-item noscript img').attr('src') ||
    '';
  return resolveImageUrl(raw);
};

const UCP_EMAIL_RE = /[A-Z0-9._%+-]+@ucp\.edu\.pk/i;

const isUcpEmail = (email) => Boolean(email && UCP_EMAIL_RE.test(email));

const extractEmail = ($) => {
  const memberItem = $('.member-item').first();

  const memberMailto = memberItem
    .find('a[href^="mailto:"]')
    .map((_, el) => $(el).attr('href')?.replace(/^mailto:/i, '').trim())
    .get()
    .find(isUcpEmail);
  if (memberMailto) return memberMailto;

  const memberMatch = memberItem.text().match(UCP_EMAIL_RE);
  if (memberMatch) return memberMatch[0];

  const pageUcpMailto = $('a[href^="mailto:"]')
    .map((_, el) => $(el).attr('href')?.replace(/^mailto:/i, '').trim())
    .get()
    .find(isUcpEmail);
  if (pageUcpMailto) return pageUcpMailto;

  const pageMatch = $('body').text().match(UCP_EMAIL_RE);
  return pageMatch ? pageMatch[0] : '';
};

const extractExtension = ($) => {
  const text = $('.member-item, .member-tax').text();
  const match = text.match(/Ext:\s*(\d+)/i);
  return match ? match[1] : '';
};

const parseTableRows = ($, $table) => {
  const rows = [];
  $table.find('tr').each((_, row) => {
    const cells = $(row)
      .find('td, th')
      .map((__, cell) => cleanText($(cell).text()))
      .get()
      .filter(Boolean);
    if (cells.length > 0) rows.push(cells);
  });
  return rows;
};

const parseQualifications = (rows) =>
  rows.map((cells) => ({
    degree: cells[0] || '',
    field: cells[1] || '',
    institution: cells[2] || '',
    year: cells[3] || '',
  }));

const parseExperience = (rows) =>
  rows.map((cells) => ({
    role: cells[0] || '',
    organization: cells[1] || '',
    period: cells[2] || '',
  }));

const parsePublications = ($, $body) => {
  const items = [];

  $body.find('table tr').each((_, row) => {
    const text = cleanText($(row).text());
    if (text) items.push(text);
  });

  if (items.length === 0) {
    $body.find('p, li').each((_, el) => {
      const text = cleanText($(el).text());
      if (text.length > 20) items.push(text);
    });
  }

  return items;
};

const getPanelBody = ($, title) => {
  let found = null;
  $('.vc_tta-panel').each((_, panel) => {
    const panelTitle = cleanText($(panel).find('.vc_tta-panel-title').text());
    if (panelTitle.toLowerCase() === title.toLowerCase()) {
      found = $(panel).find('.vc_tta-panel-body').first();
    }
  });
  return found;
};

export const parseTeacherProfile = (html, sourceUrl = '') => {
  const $ = cheerio.load(html);
  const name = cleanText($('h1').first().text()) || cleanText($('.member-item h3').first().text());
  const designation =
    cleanText($('.member-item h4.small-text').first().text()) ||
    cleanText($('.member-item h4').first().text());

  const summaryPanel = getPanelBody($, 'Profile Summary');
  const qualPanel = getPanelBody($, 'Qualification');
  const expPanel = getPanelBody($, 'Experience');
  const pubPanel = getPanelBody($, 'Publications');

  const qualRows = qualPanel ? parseTableRows($, qualPanel.find('table')) : [];
  const expRows = expPanel ? parseTableRows($, expPanel.find('table')) : [];

  let profileSummary = '';
  if (summaryPanel) {
    profileSummary = summaryPanel
      .find('p')
      .map((_, p) => cleanText($(p).text()))
      .get()
      .filter(Boolean)
      .join('\n\n');
    if (!profileSummary) profileSummary = cleanText(summaryPanel.text());
  }

  return {
    name,
    designation,
    imageUrl: extractImage($),
    email: extractEmail($),
    extension: extractExtension($),
    profileSummary,
    qualifications: parseQualifications(qualRows),
    experience: parseExperience(expRows),
    publications: pubPanel ? parsePublications($, pubPanel) : [],
    sourceUrl,
    profileScrapedAt: new Date().toISOString(),
  };
};

export const scrapeTeacherProfile = async (sourceUrl) => {
  if (!sourceUrl || !sourceUrl.includes('ucp.edu.pk')) return null;

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/html',
      },
    });

    if (!response.ok) return null;
    const html = await response.text();
    return parseTeacherProfile(html, sourceUrl);
  } catch {
    return null;
  }
};
