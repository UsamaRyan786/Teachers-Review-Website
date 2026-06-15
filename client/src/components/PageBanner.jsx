import { Link } from 'react-router-dom';

export default function PageBanner({ title, breadcrumbs = [] }) {
  return (
    <section className="page-banner">
      <div className="container">
        {breadcrumbs.length > 0 && (
          <nav className="breadcrumb" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.label}>
                {index > 0 && <span className="breadcrumb-sep">»</span>}
                {crumb.to ? (
                  <Link to={crumb.to}>{crumb.label}</Link>
                ) : (
                  <span className="breadcrumb-current">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="page-banner-title">{title}</h1>
      </div>
    </section>
  );
}
