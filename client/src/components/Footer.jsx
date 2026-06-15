export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-inner">
          <div className="footer-brand">
            <strong>University of Central Punjab</strong>
            <span>Student Teacher Reviews</span>
          </div>
          <p className="footer-note">
            Faculty data sourced from{' '}
            <a href="https://ucp.edu.pk" target="_blank" rel="noopener noreferrer">
              ucp.edu.pk
            </a>
            . Reviews are submitted by students and are not official university statements.
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} UCP Teacher Reviews · Built for UCP students</p>
        </div>
      </div>
    </footer>
  );
}
