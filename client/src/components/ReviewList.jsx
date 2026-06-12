import StarRating from './StarRating';

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function ReviewList({ reviews }) {
  if (!reviews.length) {
    return (
      <div className="empty-state empty-state-animate">
        <div className="empty-icon">💬</div>
        <h3>No reviews yet</h3>
        <p>Be the first student to share your experience with this teacher.</p>
      </div>
    );
  }

  return (
    <div className="reviews-section">
      <h2>Student Reviews ({reviews.length})</h2>
      {reviews.map((review, index) => (
        <article
          key={review._id}
          className="review-card review-card-animate"
          style={{ '--card-delay': `${Math.min(index * 0.06, 0.35)}s` }}
        >
          <div className="review-card-header">
            <div>
              <p className="reviewer-name">{review.studentName}</p>
              {review.course && <p className="review-course">{review.course}</p>}
            </div>
            <StarRating rating={review.rating} />
          </div>
          <p className="review-comment">{review.comment}</p>
          <div className="review-footer">
            <span>{formatDate(review.createdAt)}</span>
            <span className={`recommend-badge ${review.wouldRecommend ? '' : 'no-recommend'}`}>
              {review.wouldRecommend ? '✓ Recommended' : 'Not recommended'}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
