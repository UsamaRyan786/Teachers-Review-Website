import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'teachers');

const ensureDir = async () => {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
};

const extensionFromUrl = (url, contentType = '') => {
  const fromPath = path.extname(new URL(url).pathname).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(fromPath)) return fromPath;
  if (contentType.includes('webp')) return '.webp';
  if (contentType.includes('png')) return '.png';
  if (contentType.includes('jpeg')) return '.jpg';
  return '.jpg';
};

export const downloadTeacherImage = async (imageUrl, slug) => {
  if (!imageUrl || !slug || imageUrl.startsWith('/uploads/')) {
    return imageUrl || '';
  }

  try {
    await ensureDir();
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'image/*',
      },
    });

    if (!response.ok) return imageUrl;

    const contentType = response.headers.get('content-type') || '';
    const ext = extensionFromUrl(imageUrl, contentType);
    const filename = `${slug}${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    const buffer = Buffer.from(await response.arrayBuffer());

    if (buffer.length < 500) return imageUrl;

    await fs.writeFile(filePath, buffer);
    return `/uploads/teachers/${filename}`;
  } catch {
    return imageUrl;
  }
};

export const isLocalImage = (imageUrl) => Boolean(imageUrl?.startsWith('/uploads/'));
