import { Link } from 'react-router-dom';
import StarRating from './StarRating';

const getInitials = (name) => {
  const parts = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.|Engr\.)\s*/i, '').split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export default function TeacherCard({ teacher, index = 0 }) {
  return (
    <Link
      to={`/teacher/${teacher._id}`}
      className="teacher-card-link"
      style={{ '--card-delay': `${Math.min(index * 0.05, 0.4)}s` }}
      aria-label={`View ${teacher.name} profile and reviews`}
    >
      <article className="teacher-card">
        <div className="teacher-card-header">
          <div className="teacher-avatar">{getInitials(teacher.name)}</div>
          <div className="teacher-info">
            <h3>{teacher.name}</h3>
            <p className="teacher-designation">{teacher.designation}</p>
          </div>
        </div>
        <div className="teacher-meta">
          <span className="meta-tag">🏛 {teacher.faculty}</span>
          {teacher.department !== 'General' && (
            <span className="meta-tag">📚 {teacher.department}</span>
          )}
        </div>
        <div className="teacher-card-footer">
          <div className="rating-display">
            <StarRating rating={teacher.averageRating || 0} />
            <span className="rating-value">
              {teacher.reviewCount > 0 ? teacher.averageRating.toFixed(1) : '—'}
            </span>
            <span className="review-count">
              ({teacher.reviewCount} review{teacher.reviewCount !== 1 ? 's' : ''})
            </span>
          </div>
          <span className="view-link">View & Review →</span>
        </div>
      </article>
    </Link>
  );
}
