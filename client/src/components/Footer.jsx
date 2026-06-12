export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>
          <strong>UCP Teacher Reviews</strong> — Helping students make informed decisions
        </p>
        <p className="footer-note">
          Faculty data sourced from{' '}
          <a href="https://ucp.edu.pk" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-light)' }}>
            ucp.edu.pk
          </a>
          . Reviews are submitted by students and are not official university statements.
        </p>
      </div>
    </footer>
  );
}
