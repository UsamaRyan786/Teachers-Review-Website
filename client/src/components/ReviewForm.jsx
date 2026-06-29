import { useState } from 'react';
import StarRating from './StarRating';
import { api } from '../api';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function ReviewForm({ teacherId, onReviewSubmitted }) {
  const [form, setForm] = useState({
    studentName: '',
    course: '',
    rating: 0,
    comment: '',
    wouldRecommend: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.studentName.trim() || !form.comment.trim() || form.rating < 1) {
      setError('Please fill in your name, rating, and review comment.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    try {
      const result = await api.submitReview({
        teacherId,
        studentName: form.studentName,
        course: form.course,
        rating: form.rating,
        comment: form.comment,
        wouldRecommend: form.wouldRecommend,
      });

      let successMsg = 'Thank you! Your review has been submitted.';
      if (result.emailNotification?.sent) {
        successMsg += ` The teacher has been notified by email.`;
      } else if (result.emailNotification?.reason === 'no_teacher_email') {
        successMsg += ` (This teacher has no email on file, so no notification was sent.)`;
      }

      setSuccess(successMsg);
      setForm({ studentName: '', course: '', rating: 0, comment: '', wouldRecommend: true });
      onReviewSubmitted?.();
    } catch (err) {
      setError(err.message);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const charCount = form.comment.length;
  const charMax = 2000;

  return (
    <div className={`review-form-card ${shake ? 'shake' : ''}`}>
      <h3>Write a Review</h3>
      {error && <div className="form-error form-flash">{error}</div>}
      {success && <div className="form-success form-flash">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="studentName">Your Name *</label>
          <input
            id="studentName"
            type="text"
            placeholder="e.g. Ahmed Khan"
            value={form.studentName}
            onChange={(e) => setForm({ ...form, studentName: e.target.value })}
            maxLength={100}
          />
        </div>
        <div className="form-group">
          <label htmlFor="course">Course (optional)</label>
          <input
            id="course"
            type="text"
            placeholder="e.g. Data Structures"
            value={form.course}
            onChange={(e) => setForm({ ...form, course: e.target.value })}
            maxLength={100}
          />
        </div>
        <div className="form-group">
          <label>
            Your Rating * {form.rating > 0 && <span className="rating-picked">{RATING_LABELS[form.rating]}</span>}
          </label>
          <StarRating
            rating={form.rating}
            size="lg"
            interactive
            onChange={(rating) => setForm({ ...form, rating })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="comment">Your Review *</label>
          <textarea
            id="comment"
            placeholder="Share your experience with this teacher — teaching style, clarity, fairness, etc."
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            maxLength={charMax}
          />
          <span className={`char-count ${charCount > charMax * 0.9 ? 'char-warn' : ''}`}>
            {charCount}/{charMax}
          </span>
        </div>
        <div className="checkbox-group">
          <input
            id="recommend"
            type="checkbox"
            checked={form.wouldRecommend}
            onChange={(e) => setForm({ ...form, wouldRecommend: e.target.checked })}
          />
          <label htmlFor="recommend">I would recommend this teacher</label>
        </div>
        <button type="submit" className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
