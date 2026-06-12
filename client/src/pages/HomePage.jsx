import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import TeacherCard from '../components/TeacherCard';
import TeacherSearch from '../components/TeacherSearch';
import SkeletonCard from '../components/SkeletonCard';

export default function HomePage() {
  const [teachers, setTeachers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({ teacherCount: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    faculty: '',
    department: '',
    sort: 'name',
  });

  const loadTeachers = useCallback(async (isSearch = false) => {
    if (isSearch) setSearching(true);
    else setLoading(true);

    try {
      const teachersData = await api.getTeachers(filters);
      setTeachers(teachersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [filters]);

  const loadMeta = useCallback(async () => {
    try {
      const [facultiesData, departmentsData, statsData] = await Promise.all([
        api.getFaculties(),
        api.getDepartments(filters.faculty),
        api.getStats(),
      ]);
      setFaculties(facultiesData);
      setDepartments(departmentsData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    }
  }, [filters.faculty]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    const isSearch = Boolean(filters.search || filters.faculty || filters.department);
    const timer = setTimeout(() => loadTeachers(isSearch), filters.search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadTeachers, filters.search, filters.faculty, filters.department, filters.sort]);

  const handleFacultyChange = (faculty) => {
    setFilters((prev) => ({ ...prev, faculty, department: '' }));
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const result = await api.scrapeTeachers();
      setSyncMsg(result.message);
      await Promise.all([loadTeachers(), loadMeta()]);
    } catch (err) {
      setSyncMsg(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const hasActiveFilters =
    filters.search || filters.faculty || filters.department || filters.sort !== 'name';

  const clearFilters = () => {
    setFilters({ search: '', faculty: '', department: '', sort: 'name' });
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <span className="hero-badge">University of Central Punjab</span>
          <h2>Honest Student Reviews for UCP Faculty</h2>
          <p>
            Browse teachers imported from the official UCP website, read peer reviews, and share
            your own experience to help fellow students choose the right courses.
          </p>
          <div className="stats-row">
            <div className="stat-item stat-animate">
              <div className="stat-value">{stats.teacherCount}</div>
              <div className="stat-label">Teachers Listed</div>
            </div>
            <div className="stat-item stat-animate" style={{ animationDelay: '0.1s' }}>
              <div className="stat-value">{stats.reviewCount}</div>
              <div className="stat-label">Student Reviews</div>
            </div>
            <div className="stat-item stat-animate" style={{ animationDelay: '0.2s' }}>
              <div className="stat-value">{faculties.length}</div>
              <div className="stat-label">Faculties</div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <section className="filters-section">
          <div className="filters-card filters-card-extended">
            <div className="filter-group filter-group-search">
              <label htmlFor="search">Search Teachers</label>
              <TeacherSearch
                value={filters.search}
                onChange={(search) => setFilters((prev) => ({ ...prev, search }))}
                faculty={filters.faculty}
                department={filters.department}
                searching={searching}
              />
            </div>
            <div className="filter-group">
              <label htmlFor="faculty">Faculty</label>
              <select
                id="faculty"
                value={filters.faculty}
                onChange={(e) => handleFacultyChange(e.target.value)}
              >
                <option value="">All Faculties</option>
                {faculties.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                value={filters.department}
                onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="sort">Sort By</label>
              <select
                id="sort"
                value={filters.sort}
                onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
              >
                <option value="name">Name (A-Z)</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviewed</option>
              </select>
            </div>
          </div>
        </section>

        <div className="sync-bar">
          {syncMsg && <span className="sync-message">{syncMsg}</span>}
          <button className={`btn btn-outline ${syncing ? 'btn-loading' : ''}`} onClick={handleSync} disabled={syncing}>
            {syncing ? 'Syncing from UCP...' : '↻ Refresh UCP Data'}
          </button>
        </div>

        <div className="section-header-row">
          <div>
            <h2 className="section-title">Faculty Directory</h2>
            <p className="section-subtitle">
              {loading
                ? 'Loading...'
                : `${teachers.length} teacher${teachers.length !== 1 ? 's' : ''} found${
                    filters.search ? ` for "${filters.search}"` : ''
                  }${filters.department ? ` in ${filters.department}` : ''}`}
            </p>
          </div>
          {hasActiveFilters && !loading && (
            <button type="button" className="btn btn-ghost" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="teachers-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : teachers.length === 0 ? (
          <div className="empty-state empty-state-animate">
            <div className="empty-icon">🔍</div>
            <h3>No teachers found</h3>
            <p>
              {filters.search || filters.department
                ? 'No teachers match your search or department filter. Try a different name or clear filters.'
                : 'Try adjusting your search or click "Refresh UCP Data" to import faculty from ucp.edu.pk'}
            </p>
            {hasActiveFilters ? (
              <button className="btn btn-primary" onClick={clearFilters} style={{ marginTop: '1rem' }}>
                Clear filters
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleSync} style={{ marginTop: '1rem' }}>
                Import from UCP Website
              </button>
            )}
          </div>
        ) : (
          <div className={`teachers-grid ${searching ? 'grid-updating' : ''}`}>
            {teachers.map((teacher, index) => (
              <TeacherCard key={teacher._id} teacher={teacher} index={index} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
