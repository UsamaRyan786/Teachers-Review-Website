export const SITE_NAME = 'UCP Teacher Reviews';

export const SITE_TAGLINE = 'Honest student reviews for UCP faculty';

export const SITE_PURPOSE =
  'Browse teachers from the official UCP website, read peer reviews, and share your own experience to help fellow students choose the right courses.';

export const DEFAULT_PAGE_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;

export const formatPageTitle = (pageTitle) =>
  pageTitle ? `${pageTitle} | ${SITE_NAME}` : DEFAULT_PAGE_TITLE;
