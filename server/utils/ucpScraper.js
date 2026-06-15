import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const FACULTY_PAGES = [
  {
    faculty: 'Faculty of Information Technology & Computer Science',
    url: 'https://ucp.edu.pk/faculty-of-information-technology-and-computer-science/faculty-members/',
  },
  {
    faculty: 'Faculty of Science & Technology',
    url: 'https://ucp.edu.pk/faculty-of-science-technology/faculty-members-2/',
  },
  {
    faculty: 'Faculty of Humanities & Social Sciences',
    url: 'https://ucp.edu.pk/faculty-of-humanities-and-social-sciences/faculty-members/',
  },
  {
    faculty: 'Faculty of Management Sciences',
    url: 'https://ucp.edu.pk/faculty-of-management-sciences/ucp-business-school/faculty-members/',
  },
  {
    faculty: 'Faculty of Engineering',
    url: 'https://ucp.edu.pk/faculty-of-engineering/faculty-members/',
  },
  {
    faculty: 'Faculty of Law',
    url: 'https://ucp.edu.pk/faculty-of-law/faculty-members/',
  },
  {
    faculty: 'Faculty of Pharmaceutical Sciences',
    url: 'https://ucp.edu.pk/faculty-of-pharmaceutical-sciences/faculty-members/',
  },
  {
    faculty: 'Faculty of Media & Mass Communication',
    url: 'https://ucp.edu.pk/faculty-of-media-and-mass-communication/faculty-members/',
  },
];

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

const resolveImageUrl = (raw) => {
  if (!raw || raw.startsWith('data:')) return '';
  if (raw.startsWith('http')) return raw;
  return `https://ucp.edu.pk${raw.startsWith('/') ? '' : '/'}${raw}`;
};

const extractMemberImage = ($, el) => {
  const img = $(el).find('.item-thumbnail img').first();
  const raw =
    img.attr('data-lazy-src') ||
    img.attr('data-src') ||
    img.attr('src') ||
    $(el).find('.item-thumbnail noscript img').attr('src') ||
    '';
  return resolveImageUrl(raw);
};

const isDepartmentHeader = (text) => {
  const lower = text.toLowerCase();
  return lower.startsWith('department of') || (lower.includes('department of') && text.length < 80);
};

export const parseTeachersFromHtml = (html, faculty, sourceUrl) => {
  const $ = cheerio.load(html);
  const teachers = [];
  let currentDepartment = 'General';

  // Walk content in document order: department headers then member cards
  const contentRoot = $('.wpb_content_element, .entry-content, main, body').first();
  const root = contentRoot.length ? contentRoot : $('body');

  root.find('h4, .member-item').each((_, el) => {
    const isMember = $(el).hasClass('member-item');

    if (!isMember) {
      const text = cleanText($(el).text());
      if (isDepartmentHeader(text)) {
        currentDepartment = text.replace(/^department of\s*/i, '').trim() || text;
      }
      return;
    }

    const name = cleanText($(el).find('h3.item-title, h3').first().text());
    const designation = cleanText($(el).find('h4.small-text, h4').first().text());
    const profileUrl = $(el).find('h3 a, .item-thumbnail a').first().attr('href') || '';
    const imageUrl = extractMemberImage($, el);
    const deptText = cleanText($(el).find('p').first().text());

    let department = currentDepartment;
    if (deptText && deptText.toLowerCase().startsWith('department of')) {
      department = deptText.replace(/^department of\s*/i, '').trim();
    } else if (deptText && !deptText.toLowerCase().startsWith('faculty of') && deptText.length < 60) {
      department = deptText;
    }

    if (!name || name.length < 3) return;

    teachers.push({
      name,
      designation: designation || 'Faculty Member',
      department,
      faculty,
      imageUrl,
      sourceUrl: profileUrl || sourceUrl,
      slug: slugify(`${name}-${faculty}`),
    });
  });

  // Fallback: pair h3 names with preceding h4 designations in document order
  if (teachers.length === 0) {
    let dept = 'General';
    const elements = $('h4, h3').toArray();

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const tag = el.tagName?.toLowerCase();
      const text = cleanText($(el).text());

      if (tag === 'h4' && isDepartmentHeader(text)) {
        dept = text.replace(/^department of\s*/i, '').trim() || text;
        continue;
      }

      if (tag === 'h3' && text.length >= 3) {
        let designation = 'Faculty Member';
        for (let j = i - 1; j >= 0; j--) {
          const prev = elements[j];
          const prevTag = prev.tagName?.toLowerCase();
          const prevText = cleanText($(prev).text());
          if (prevTag === 'h4' && !isDepartmentHeader(prevText)) {
            designation = prevText;
            break;
          }
          if (prevTag === 'h3') break;
        }

        teachers.push({
          name: text,
          designation,
          department: dept,
          faculty,
          sourceUrl,
          slug: slugify(`${text}-${faculty}`),
        });
      }
    }
  }

  const unique = new Map();
  for (const teacher of teachers) {
    const key = `${teacher.name}|${teacher.faculty}`;
    if (!unique.has(key)) unique.set(key, teacher);
  }

  return [...unique.values()];
};

export const scrapeFacultyPage = async ({ faculty, url }) => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/html',
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch ${url}: ${response.status}`);
      return [];
    }

    const html = await response.text();
    const teachers = parseTeachersFromHtml(html, faculty, url);
    console.log(`  ✓ ${faculty}: ${teachers.length} teachers`);
    return teachers;
  } catch (err) {
    console.warn(`  ✗ ${faculty}: ${err.message}`);
    return [];
  }
};

export const scrapeAllTeachers = async () => {
  console.log('Scraping UCP faculty data...\n');
  const allTeachers = [];

  for (const page of FACULTY_PAGES) {
    const teachers = await scrapeFacultyPage(page);
    allTeachers.push(...teachers);
    await new Promise((r) => setTimeout(r, 500));
  }

  const bySlug = new Map();
  for (const teacher of allTeachers) {
    if (!bySlug.has(teacher.slug)) bySlug.set(teacher.slug, teacher);
  }

  const result = [...bySlug.values()];
  console.log(`\nTotal unique teachers scraped: ${result.length}`);
  return result;
};

export { FACULTY_PAGES };
