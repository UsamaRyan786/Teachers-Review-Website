import { useState } from 'react';
import { getTeacherImageSrc } from '../utils/teacherImage';

export const getInitials = (name) => {
  const parts = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.|Engr\.)\s*/i, '').split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export default function TeacherAvatar({ name, imageUrl, className = '', alt }) {
  const [failed, setFailed] = useState(false);
  const src = getTeacherImageSrc(imageUrl);
  const showImage = Boolean(src) && !failed;

  if (showImage) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={className}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className={`teacher-avatar-fallback ${className}`} aria-hidden="true">
      {getInitials(name)}
    </div>
  );
}
