export default function SkeletonCard() {
  return (
    <div className="teacher-card skeleton-card" aria-hidden="true">
      <div className="teacher-card-header">
        <div className="skeleton skeleton-avatar" />
        <div className="skeleton-text-group">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-subtitle" />
        </div>
      </div>
      <div className="skeleton skeleton-tag" />
      <div className="skeleton skeleton-footer" />
    </div>
  );
}
