import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          <div className="logo-icon">UCP</div>
          <div className="logo-text">
            <h1>Teacher Reviews</h1>
            <span className="logo-subtitle">University of Central Punjab</span>
          </div>
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
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Browse Teachers
          </Link>
          <a href="https://ucp.edu.pk" target="_blank" rel="noopener noreferrer">
            UCP Website ↗
          </a>
        </div>
      </div>
      {menuOpen && <button type="button" className="nav-overlay" onClick={toggleMenu} aria-label="Close menu" />}
    </nav>
  );
}
