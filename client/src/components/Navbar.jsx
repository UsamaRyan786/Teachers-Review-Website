import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const UCP_LOGO =
  'https://ucp.edu.pk/inc/uploads/2019/06/ucp-sticky-logo-white-1.png';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isReviews =
    location.pathname === '/reviews' || location.pathname.startsWith('/teacher/');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    document.body.style.overflow = '';
  }, [location.pathname]);

  const toggleMenu = () => {
    setMenuOpen((open) => {
      document.body.style.overflow = open ? '' : 'hidden';
      return !open;
    });
  };

  return (
    <header className={`site-header ${scrolled ? 'site-header-scrolled' : ''}`}>
      <div className="top-bar">
        <div className="container top-bar-inner">
          <span className="top-bar-text">University of Central Punjab</span>
          <a
            href="https://ucp.edu.pk"
            target="_blank"
            rel="noopener noreferrer"
            className="top-bar-link"
          >
            Official UCP Website ↗
          </a>
        </div>
      </div>
      <nav className="main-nav">
        <div className="container navbar-inner">
          <Link to="/" className="logo">
            <img src={UCP_LOGO} alt="University of Central Punjab" className="logo-img" />
            <span className="logo-tag">Teacher Reviews</span>
          </Link>

          <button
            type="button"
            className={`nav-toggle ${menuOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <div className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
            <Link to="/" className={isHome ? 'active' : ''}>
              Home
            </Link>
            <Link to="/reviews" className={isReviews ? 'active' : ''}>
              Teacher Reviews
            </Link>
            <a href="https://ucp.edu.pk" target="_blank" rel="noopener noreferrer">
              ucp.edu.pk
            </a>
          </div>
        </div>
      </nav>
      {menuOpen && (
        <button type="button" className="nav-overlay" onClick={toggleMenu} aria-label="Close menu" />
      )}
    </header>
  );
}
