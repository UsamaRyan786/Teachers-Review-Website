import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import TeacherAvatar from './TeacherAvatar';
import { getTeacherPath } from '../utils/teacherPath';

export default function TeacherCard({ teacher, index = 0 }) {
  return (
    <Link
      to={getTeacherPath(teacher)}
      className="member-item-link"
      style={{ '--card-delay': `${Math.min(index * 0.04, 0.4)}s` }}
      aria-label={`View ${teacher.name} profile and reviews`}
    >
      <article className="member-item">
        <div className="member-item-inner">
          <div className="item-thumbnail">
            <TeacherAvatar
              name={teacher.name}
              imageUrl={teacher.imageUrl}
              className="member-photo"
              alt={teacher.name}
            />
          </div>
          <div className="item-content">
            <h3 className="item-title">{teacher.name}</h3>
            <h4 className="small-text">{teacher.designation}</h4>
            {teacher.department !== 'General' && (
              <p className="member-department">{teacher.department}</p>
            )}
          </div>
          <div className="member-reviews">
            <StarRating rating={teacher.averageRating || 0} />
            <span className="member-rating-text">
              {teacher.reviewCount > 0 ? teacher.averageRating.toFixed(1) : 'No ratings yet'}
              {teacher.reviewCount > 0 && (
                <span className="review-count">
                  {' '}
                  · {teacher.reviewCount} review{teacher.reviewCount !== 1 ? 's' : ''}
                </span>
              )}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
