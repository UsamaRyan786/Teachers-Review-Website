import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

const isAllowedImageUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'ucp.edu.pk' && parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

router.get('/proxy', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || !isAllowedImageUrl(url)) {
      return res.status(400).json({ message: 'Invalid image URL' });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'image/*',
        Referer: 'https://ucp.edu.pk/',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Image not found' });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=604800');
    res.set('Access-Control-Allow-Origin', '*');

    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
