export default function TeacherProfile({ teacher }) {
  const hasSummary = Boolean(teacher.profileSummary);
  const hasQualifications = teacher.qualifications?.length > 0;
  const hasExperience = teacher.experience?.length > 0;
  const hasPublications = teacher.publications?.length > 0;
  const hasContact = teacher.email || teacher.extension;

  if (!hasSummary && !hasQualifications && !hasExperience && !hasPublications && !hasContact) {
    return (
      <section className="ucp-profile ucp-profile-empty">
        <h2>UCP Faculty Profile</h2>
        <p>
          Full profile data from ucp.edu.pk will load automatically when you open this page.
          {teacher.sourceUrl && (
            <>
              {' '}
              You can also view the{' '}
              <a href={teacher.sourceUrl} target="_blank" rel="noopener noreferrer">
                official UCP profile ↗
              </a>
              .
            </>
          )}
        </p>
      </section>
    );
  }

  return (
    <section className="ucp-profile">
      <h2>UCP Faculty Profile</h2>

      {hasContact && (
        <div className="profile-contact">
          {teacher.email && (
            <a href={`mailto:${teacher.email}`} className="profile-contact-item">
              ✉ {teacher.email}
            </a>
          )}
          {teacher.extension && (
            <span className="profile-contact-item">📞 Ext: {teacher.extension}</span>
          )}
        </div>
      )}

      {hasSummary && (
        <div className="profile-section">
          <h3 className="profile-section-title">Profile Summary</h3>
          <div className="profile-summary">
            {teacher.profileSummary.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      )}

      {hasQualifications && (
        <div className="profile-section">
          <h3 className="profile-section-title">Qualification</h3>
          <div className="profile-table-wrap">
            <table className="profile-table">
              <thead>
                <tr>
                  <th>Degree</th>
                  <th>Field</th>
                  <th>Institution</th>
                  <th>Year</th>
                </tr>
              </thead>
              <tbody>
                {teacher.qualifications.map((row, i) => (
                  <tr key={i}>
                    <td>{row.degree}</td>
                    <td>{row.field}</td>
                    <td>{row.institution}</td>
                    <td>{row.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {hasExperience && (
        <div className="profile-section">
          <h3 className="profile-section-title">Experience</h3>
          <div className="profile-table-wrap">
            <table className="profile-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Organization</th>
                  <th>Period</th>
                </tr>
              </thead>
              <tbody>
                {teacher.experience.map((row, i) => (
                  <tr key={i}>
                    <td>{row.role}</td>
                    <td>{row.organization}</td>
                    <td>{row.period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {hasPublications && (
        <div className="profile-section">
          <h3 className="profile-section-title">Publications</h3>
          <ol className="profile-publications">
            {teacher.publications.map((pub, i) => (
              <li key={i}>{pub.replace(/^\d+/, '').trim()}</li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
