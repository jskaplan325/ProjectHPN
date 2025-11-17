import React, { useState } from 'react';

function DepartmentView({ departments }) {
  const [expandedDepts, setExpandedDepts] = useState(new Set());

  if (!departments || departments.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Department Data</h3>
        <p>Please upload Team Roster and Project Data files to view department capacity.</p>
      </div>
    );
  }

  const getUtilizationColor = (utilization) => {
    if (utilization > 100) return '#e74c3c';
    if (utilization > 80) return '#f39c12';
    return '#27ae60';
  };

  const toggleDepartment = (deptIndex) => {
    const newExpanded = new Set(expandedDepts);
    if (newExpanded.has(deptIndex)) {
      newExpanded.delete(deptIndex);
    } else {
      newExpanded.add(deptIndex);
    }
    setExpandedDepts(newExpanded);
  };

  const isExpanded = (deptIndex) => expandedDepts.has(deptIndex);

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Department Capacity View</h2>

      {/* Summary Table */}
      <div className="data-table" style={{ marginBottom: '2rem' }}>
        <h3 style={{ padding: '1.5rem', borderBottom: '2px solid #ecf0f1', margin: 0 }}>Department Summary</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Resources</th>
                <th>Total Capacity</th>
                <th>Allocated</th>
                <th>Available</th>
                <th>Utilization</th>
                <th>Projects</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, deptIndex) => (
                <tr key={deptIndex} style={{ cursor: 'pointer' }} onClick={() => toggleDepartment(deptIndex)}>
                  <td style={{ fontWeight: '600', color: '#2c3e50' }}>{dept.name}</td>
                  <td>{dept.resourceCount}</td>
                  <td>{dept.totalCapacity.toLocaleString()} hrs</td>
                  <td>{dept.allocatedHours.toFixed(0)} hrs</td>
                  <td style={{ color: dept.availableHours < 0 ? '#e74c3c' : '#27ae60', fontWeight: '600' }}>
                    {dept.availableHours.toFixed(0)} hrs
                  </td>
                  <td>
                    <span style={{
                      color: getUtilizationColor(dept.utilization),
                      fontWeight: 'bold',
                      fontSize: '1.05rem'
                    }}>
                      {dept.utilization.toFixed(1)}%
                    </span>
                  </td>
                  <td>{dept.projects.length}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '1.2rem', color: '#3498db' }}>
                      {isExpanded(deptIndex) ? '▼' : '▶'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded Department Details */}
      {departments.map((dept, deptIndex) => isExpanded(deptIndex) && (
        <div key={deptIndex} className="department-section" style={{ marginBottom: '2rem' }}>
          <div className="department-header">
            <div>
              <h3 className="department-name">{dept.name} - Detailed View</h3>
              <div className="department-meta">
                {dept.resourceCount} resource{dept.resourceCount !== 1 ? 's' : ''} •
                {dept.totalCapacity.toLocaleString()} hrs annual capacity
              </div>
            </div>
            <button
              className="collapse-button"
              onClick={() => toggleDepartment(deptIndex)}
            >
              Collapse
            </button>
          </div>

          {/* Monthly Projections */}
          <div className="timeline-section">
            <h4 className="timeline-title">Next 3 Months</h4>
            <div className="timeline-grid">
              {dept.monthlyProjections.map((month, idx) => (
                <div key={idx} className="timeline-card">
                  <div className="timeline-period">{month.period}</div>
                  <div className="timeline-metrics">
                    <div className="timeline-metric">
                      <span className="metric-label">Capacity</span>
                      <span className="metric-value">{month.capacity.toFixed(0)} hrs</span>
                    </div>
                    <div className="timeline-metric">
                      <span className="metric-label">Allocated</span>
                      <span className="metric-value">{month.allocatedHours.toFixed(0)} hrs</span>
                    </div>
                    <div className="timeline-metric">
                      <span className="metric-label">Available</span>
                      <span
                        className="metric-value"
                        style={{ color: month.availableHours < 0 ? '#e74c3c' : '#27ae60' }}
                      >
                        {month.availableHours.toFixed(0)} hrs
                      </span>
                    </div>
                    <div className="timeline-metric">
                      <span className="metric-label">Utilization</span>
                      <div className="utilization-bar-container">
                        <div
                          className="utilization-bar"
                          style={{
                            width: `${Math.min(month.utilization, 100)}%`,
                            backgroundColor: getUtilizationColor(month.utilization)
                          }}
                        />
                        <span
                          className="utilization-text"
                          style={{ color: getUtilizationColor(month.utilization) }}
                        >
                          {month.utilization.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quarterly Projections */}
          <div className="timeline-section">
            <h4 className="timeline-title">Next 3 Quarters</h4>
            <div className="timeline-grid">
              {dept.quarterlyProjections.map((quarter, idx) => (
                <div key={idx} className="timeline-card">
                  <div className="timeline-period">{quarter.period}</div>
                  <div className="timeline-metrics">
                    <div className="timeline-metric">
                      <span className="metric-label">Capacity</span>
                      <span className="metric-value">{quarter.capacity.toFixed(0)} hrs</span>
                    </div>
                    <div className="timeline-metric">
                      <span className="metric-label">Allocated</span>
                      <span className="metric-value">{quarter.allocatedHours.toFixed(0)} hrs</span>
                    </div>
                    <div className="timeline-metric">
                      <span className="metric-label">Available</span>
                      <span
                        className="metric-value"
                        style={{ color: quarter.availableHours < 0 ? '#e74c3c' : '#27ae60' }}
                      >
                        {quarter.availableHours.toFixed(0)} hrs
                      </span>
                    </div>
                    <div className="timeline-metric">
                      <span className="metric-label">Utilization</span>
                      <div className="utilization-bar-container">
                        <div
                          className="utilization-bar"
                          style={{
                            width: `${Math.min(quarter.utilization, 100)}%`,
                            backgroundColor: getUtilizationColor(quarter.utilization)
                          }}
                        />
                        <span
                          className="utilization-text"
                          style={{ color: getUtilizationColor(quarter.utilization) }}
                        >
                          {quarter.utilization.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Projects */}
          {dept.projects.length > 0 && (
            <div className="department-projects">
              <h4 className="timeline-title">Active Projects ({dept.projects.length})</h4>
              <div className="projects-list">
                {dept.projects.map((project, idx) => (
                  <div key={idx} className="project-item">
                    <div className="project-name">{project.initiative}</div>
                    <div className="project-details">
                      <span>{project.duration} months</span>
                      <span>•</span>
                      <span>{project.totalHours.toFixed(0)} hrs</span>
                      <span>•</span>
                      <span>{project.resources.length} resource{project.resources.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default DepartmentView;
