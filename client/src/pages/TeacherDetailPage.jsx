import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import SkeletonCard from '../components/SkeletonCard';

const getInitials = (name) => {
  const parts = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.|Engr\.)\s*/i, '').split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export default function TeacherDetailPage() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTeacher = useCallback(async () => {
    setLoading(true);
    try {
      const [teacherData, reviewsData] = await Promise.all([
        api.getTeacher(id),
        api.getReviews(id),
      ]);
      setTeacher(teacherData);
      setReviews(reviewsData);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTeacher();
  }, [loadTeacher]);

  const handleReviewSubmitted = async () => {
    const [teacherData, reviewsData] = await Promise.all([
      api.getTeacher(id),
      api.getReviews(id),
    ]);
    setTeacher(teacherData);
    setReviews(reviewsData);
  };

  if (loading) {
    return (
      <div className="container detail-page">
        <div className="skeleton skeleton-back" />
        <div className="detail-header skeleton-detail-header">
          <div className="skeleton skeleton-detail-avatar" />
          <div className="skeleton-text-group" style={{ flex: 1 }}>
            <div className="skeleton skeleton-title" style={{ width: '70%' }} />
            <div className="skeleton skeleton-subtitle" style={{ width: '50%' }} />
            <div className="skeleton skeleton-tag" style={{ marginTop: '0.5rem' }} />
          </div>
        </div>
        <div className="detail-grid">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="container detail-page">
        <Link to="/" className="back-link">← Back to all teachers</Link>
        <div className="empty-state empty-state-animate">
          <div className="empty-icon">👤</div>
          <h3>Teacher not found</h3>
          <p>{error || 'This teacher may have been removed.'}</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Browse all teachers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container detail-page">
      <Link to="/" className="back-link">← Back to all teachers</Link>

      <header className="detail-header detail-header-animate">
        <div className="detail-avatar">{getInitials(teacher.name)}</div>
        <div className="detail-info">
          <h1>{teacher.name}</h1>
          <p className="teacher-designation" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
            {teacher.designation}
          </p>
          <div className="teacher-meta">
            <span className="meta-tag">🏛 {teacher.faculty}</span>
            {teacher.department !== 'General' && (
              <span className="meta-tag">📚 {teacher.department}</span>
            )}
            {teacher.sourceUrl && (
              <a
                href={teacher.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="meta-tag meta-link"
              >
                🔗 View on UCP Website
              </a>
            )}
          </div>
        </div>
        <div className="detail-rating-box">
          <div className="big-rating">
            {teacher.reviewCount > 0 ? teacher.averageRating.toFixed(1) : '—'}
          </div>
          <StarRating rating={teacher.averageRating || 0} size="lg" />
          <p className="review-count" style={{ marginTop: '0.5rem' }}>
            {teacher.reviewCount} review{teacher.reviewCount !== 1 ? 's' : ''}
          </p>
        </div>
      </header>

      <div className="detail-grid">
        <div className="detail-reviews">
          <ReviewList reviews={reviews} />
        </div>
        <div className="detail-form">
          <ReviewForm teacherId={teacher._id} onReviewSubmitted={handleReviewSubmitted} />
        </div>
      </div>
    </div>
  );
}
