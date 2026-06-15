import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import SkeletonCard from '../components/SkeletonCard';
import PageBanner from '../components/PageBanner';
import TeacherAvatar from '../components/TeacherAvatar';
import TeacherProfile from '../components/TeacherProfile';
import usePageTitle from '../hooks/usePageTitle';

export default function TeacherDetailPage() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTeacher = useCallback(async () => {
    setLoading(true);
    try {
      const teacherData = await api.getTeacher(id);
      const reviewsData = await api.getReviews(teacherData._id);
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

  usePageTitle(teacher?.name);

  const handleReviewSubmitted = async () => {
    const teacherData = await api.getTeacher(id);
    const reviewsData = await api.getReviews(teacherData._id);
    setTeacher(teacherData);
    setReviews(reviewsData);
  };

  if (loading) {
    return (
      <>
        <PageBanner title="Faculty Profile" breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Loading...' }]} />
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
      </>
    );
  }

  if (error || !teacher) {
    return (
      <>
        <PageBanner title="Faculty Profile" breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Not found' }]} />
        <div className="container detail-page">
          <Link to="/" className="back-link">
            ← Back to faculty directory
          </Link>
          <div className="empty-state empty-state-animate">
            <h3>Teacher not found</h3>
            <p>{error || 'This teacher may have been removed.'}</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Browse all teachers
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBanner
        title={teacher.name}
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Faculty Directory', to: '/' },
          { label: teacher.name },
        ]}
      />

      <div className="container detail-page">
        <Link to="/" className="back-link">
          ← Back to faculty directory
        </Link>

        <header className="detail-header detail-header-animate">
          <div className="detail-photo-wrap">
            <TeacherAvatar
              name={teacher.name}
              imageUrl={teacher.imageUrl}
              className="detail-photo"
              alt={teacher.name}
            />
          </div>
          <div className="detail-info">
            <h1>{teacher.name}</h1>
            <h4 className="detail-designation">{teacher.designation}</h4>
            <div className="teacher-meta">
              <span className="meta-tag">{teacher.faculty}</span>
              {teacher.department !== 'General' && (
                <span className="meta-tag">{teacher.department}</span>
              )}
              {teacher.email && (
                <a href={`mailto:${teacher.email}`} className="meta-tag meta-link">
                  ✉ {teacher.email}
                </a>
              )}
              {teacher.extension && <span className="meta-tag">Ext: {teacher.extension}</span>}
              {teacher.sourceUrl && (
                <a
                  href={teacher.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="meta-tag meta-link"
                >
                  View on UCP Website ↗
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

        <TeacherProfile teacher={teacher} />

        <div className="detail-grid">
          <div className="detail-reviews">
            <ReviewList reviews={reviews} />
          </div>
          <div className="detail-form">
            <ReviewForm teacherId={teacher._id} onReviewSubmitted={handleReviewSubmitted} />
          </div>
        </div>
      </div>
    </>
  );
}
