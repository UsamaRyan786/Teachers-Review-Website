const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || '';

export const getTeacherImageSrc = (imageUrl) => {
  if (!imageUrl) return '';

  if (imageUrl.startsWith('/uploads/')) {
    return `${API_ORIGIN}${imageUrl}`;
  }

  if (imageUrl.startsWith('https://ucp.edu.pk/')) {
    return `${API_ORIGIN}/api/images/proxy?url=${encodeURIComponent(imageUrl)}`;
  }

  return imageUrl;
};
