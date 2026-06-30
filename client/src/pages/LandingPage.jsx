import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import TeacherCard from '../components/TeacherCard';
import PageBanner from '../components/PageBanner';
import usePageTitle from '../hooks/usePageTitle';
import { SITE_NAME, SITE_PURPOSE, SITE_TAGLINE } from '../config/site';

export default function LandingPage() {
  const [stats, setStats] = useState({ teacherCount: 0, reviewCount: 0, topRated: [] });
  const [facultyCount, setFacultyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  usePageTitle('');

  useEffect(() => {
    Promise.all([api.getStats(), api.getFaculties()])
      .then(([statsData, facultiesData]) => {
        setStats(statsData);
        setFacultyCount(facultiesData.length);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageBanner
        title={SITE_NAME}
        subtitle={`${SITE_TAGLINE}. ${SITE_PURPOSE}`}
        breadcrumbs={[{ label: 'Home' }]}
      />

      <div className="container page-content landing-page">
        <div className="stats-strip">
          <div className="stat-item">
            <strong>{loading ? '—' : stats.teacherCount}</strong>
            <span>Teachers</span>
          </div>
          <div className="stat-item">
            <strong>{loading ? '—' : stats.reviewCount}</strong>
            <span>Student Reviews</span>
          </div>
          <div className="stat-item">
            <strong>{loading ? '—' : facultyCount}</strong>
            <span>UCP Faculties</span>
          </div>
        </div>

        <section className="landing-cta">
          <div className="landing-cta-text">
            <h2>Find the right teachers before you enroll</h2>
            <p>
              Search UCP faculty by name, department, or faculty. Read what other students shared and
              leave your own review to help the community.
            </p>
          </div>
          <Link to="/reviews" className="btn btn-primary btn-lg">
            Browse Teacher Reviews →
          </Link>
        </section>

        <section className="landing-steps">
          <h2 className="landing-section-title">How it works</h2>
          <div className="landing-steps-grid">
            <article className="landing-step">
              <span className="landing-step-num">1</span>
              <h3>Browse faculty</h3>
              <p>Explore teachers synced from the official UCP website across all faculties.</p>
            </article>
            <article className="landing-step">
              <span className="landing-step-num">2</span>
              <h3>Read reviews</h3>
              <p>See ratings and honest feedback from students who took their courses.</p>
            </article>
            <article className="landing-step">
              <span className="landing-step-num">3</span>
              <h3>Share your experience</h3>
              <p>Submit a review on any teacher profile to guide fellow students.</p>
            </article>
          </div>
        </section>

        {!loading && stats.topRated?.length > 0 && (
          <section className="landing-top-rated">
            <div className="section-header-row">
              <div>
                <h2 className="landing-section-title">Top rated teachers</h2>
                <p className="section-subtitle">Based on student reviews</p>
              </div>
              <Link to="/reviews" className="btn btn-ghost">
                View all →
              </Link>
            </div>
            <div className="members-grid landing-top-grid">
              {stats.topRated.slice(0, 3).map((teacher, index) => (
                <TeacherCard key={teacher._id} teacher={teacher} index={index} />
              ))}
            </div>
          </section>
        )}

        <section className="landing-bottom-cta">
          <h2>Ready to explore UCP faculty?</h2>
          <p>Open the full directory to search, filter, and review teachers.</p>
          <Link to="/reviews" className="btn btn-primary">
            Go to Faculty Directory
          </Link>
        </section>
      </div>
    </>
  );
}
