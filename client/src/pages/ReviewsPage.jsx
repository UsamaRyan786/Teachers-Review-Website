import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../api';
import TeacherCard from '../components/TeacherCard';
import TeacherSearch from '../components/TeacherSearch';
import SkeletonCard from '../components/SkeletonCard';
import PageBanner from '../components/PageBanner';
import { groupTeachersByDepartment, groupTeachersByFaculty } from '../utils/groupTeachers';
import usePageTitle from '../hooks/usePageTitle';
import { SITE_NAME, SITE_TAGLINE } from '../config/site';

export default function ReviewsPage() {
  const [teachers, setTeachers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({ teacherCount: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncingProfiles, setSyncingProfiles] = useState(false);
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

  const handleSyncProfiles = async () => {
    setSyncingProfiles(true);
    setSyncMsg('Starting profile sync...');

    const pollStatus = async () => {
      const status = await api.getProfileSyncStatus();
      if (status.running) {
        setSyncMsg(
          `Syncing profiles... ${status.processed}/${status.total} (${status.updated} updated, ${status.failed} failed)`
        );
        return false;
      }

      setSyncMsg(status.message || 'Profile sync finished');
      setSyncingProfiles(false);
      await loadMeta();
      return true;
    };

    try {
      await api.scrapeProfiles(0);
      const finished = await pollStatus();
      if (finished) return;

      await new Promise((resolve) => {
        const interval = setInterval(async () => {
          try {
            const done = await pollStatus();
            if (done) {
              clearInterval(interval);
              resolve();
            }
          } catch (err) {
            clearInterval(interval);
            setSyncMsg(err.message);
            setSyncingProfiles(false);
            resolve();
          }
        }, 2000);
      });
    } catch (err) {
      setSyncMsg(err.message);
      setSyncingProfiles(false);
    }
  };

  const hasActiveFilters =
    filters.search || filters.faculty || filters.department || filters.sort !== 'name';

  const clearFilters = () => {
    setFilters({ search: '', faculty: '', department: '', sort: 'name' });
  };

  const groupedSections = useMemo(() => {
    if (filters.search || filters.department) {
      return [{ title: null, teachers }];
    }
    if (filters.faculty) {
      return groupTeachersByDepartment(teachers).map(([title, items]) => ({ title, teachers: items }));
    }
    return groupTeachersByFaculty(teachers).map(([title, items]) => ({ title, teachers: items }));
  }, [teachers, filters.search, filters.faculty, filters.department]);

  const pageTitle = filters.faculty || SITE_NAME;

  usePageTitle(pageTitle);

  return (
    <>
      <PageBanner
        title={pageTitle}
        subtitle={SITE_TAGLINE}
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Teacher Reviews' },
          ...(filters.faculty ? [{ label: pageTitle }] : []),
        ]}
      />

      <div className="container page-content">
        <div className="stats-strip">
          <div className="stat-item">
            <strong>{stats.teacherCount}</strong>
            <span>Teachers</span>
          </div>
          <div className="stat-item">
            <strong>{stats.reviewCount}</strong>
            <span>Reviews</span>
          </div>
          <div className="stat-item">
            <strong>{faculties.length}</strong>
            <span>Faculties</span>
          </div>
        </div>

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
                disabled={!filters.faculty && departments.length === 0}
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
          <button
            className={`btn btn-outline ${syncing ? 'btn-loading' : ''}`}
            onClick={handleSync}
            disabled={syncing || syncingProfiles}
          >
            {syncing ? 'Syncing from UCP...' : '↻ Refresh UCP Data'}
          </button>
          <button
            className={`btn btn-outline ${syncingProfiles ? 'btn-loading' : ''}`}
            onClick={handleSyncProfiles}
            disabled={syncing || syncingProfiles}
          >
            {syncingProfiles ? 'Syncing all profiles...' : '↻ Sync All UCP Profiles'}
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
          <div className="members-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : teachers.length === 0 ? (
          <div className="empty-state empty-state-animate">
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
          <div className={searching ? 'grid-updating' : ''}>
            {groupedSections.map((section) => (
              <section key={section.title || 'all'} className="faculty-section">
                {section.title && (
                  <h3 className="department-heading">
                    {section.title.startsWith('Department') || section.title.startsWith('Faculty')
                      ? section.title
                      : filters.faculty
                        ? `Department of ${section.title}`
                        : section.title}
                  </h3>
                )}
                <div className="members-grid">
                  {section.teachers.map((teacher, index) => (
                    <TeacherCard key={teacher._id} teacher={teacher} index={index} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
