import { useState } from 'react';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function StarRating({ rating, size = 'md', interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  const stars = [1, 2, 3, 4, 5];
  const display = hover || rating;
  const className = `stars ${size === 'lg' ? 'stars-lg' : ''} ${interactive ? 'stars-interactive' : ''}`;

  return (
    <div className="stars-wrap">
      <div
        className={className}
        role={interactive ? 'radiogroup' : 'img'}
        aria-label={`Rating: ${rating} out of 5`}
        onMouseLeave={interactive ? () => setHover(0) : undefined}
      >
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            className={`star ${star <= Math.round(display) ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={interactive ? () => onChange(star) : undefined}
            onMouseEnter={interactive ? () => setHover(star) : undefined}
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onChange(star);
                    }
                  }
                : undefined
            }
            role={interactive ? 'radio' : undefined}
            aria-checked={interactive ? star === rating : undefined}
            tabIndex={interactive ? 0 : -1}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
      </div>
      {interactive && (
        <span className={`rating-label ${display ? 'visible' : ''}`}>
          {RATING_LABELS[display] || 'Tap to rate'}
        </span>
      )}
    </div>
  );
}
