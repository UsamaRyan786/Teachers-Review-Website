export default function SkeletonCard() {
  return (
    <div className="member-item skeleton-card" aria-hidden="true">
      <div className="member-item-inner">
        <div className="skeleton skeleton-photo" />
        <div className="item-content">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-subtitle" />
        </div>
        <div className="skeleton skeleton-footer" />
      </div>
    </div>
  );
}
