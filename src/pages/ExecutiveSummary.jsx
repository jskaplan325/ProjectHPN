import React from 'react';

function ExecutiveSummary({ data }) {
  if (!data) {
    return (
      <div className="empty-state">
        <h3>No Data Available</h3>
        <p>Please upload Team Roster and Project Data files to view the Executive Summary.</p>
      </div>
    );
  }

  const { executiveSummary } = data;
  const {
    totalResources,
    totalAnnualCapacity,
    totalAllocatedHours,
    totalAvailableHours,
    overallUtilization,
    overUtilizedCount,
    underUtilizedCount,
    topAvailable,
    topOverUtilized
  } = executiveSummary;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Executive Summary</h2>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Active Resources</h3>
          <div className="value">{totalResources}</div>
        </div>

        <div className="metric-card">
          <h3>Total Annual Capacity</h3>
          <div className="value">{totalAnnualCapacity.toLocaleString()} hrs</div>
        </div>

        <div className="metric-card">
          <h3>Total Allocated Hours</h3>
          <div className="value">{totalAllocatedHours.toLocaleString()} hrs</div>
        </div>

        <div className="metric-card success">
          <h3>Total Available Hours</h3>
          <div className="value">{totalAvailableHours.toLocaleString()} hrs</div>
        </div>

        <div className={`metric-card ${overallUtilization > 100 ? 'warning' : ''}`}>
          <h3>Overall Utilization</h3>
          <div className="value">{overallUtilization.toFixed(1)}%</div>
        </div>

        <div className="metric-card warning">
          <h3>Over-Utilized</h3>
          <div className="value">{overUtilizedCount}</div>
        </div>

        <div className="metric-card">
          <h3>Under-Utilized</h3>
          <div className="value">{underUtilizedCount}</div>
        </div>
      </div>

      <div className="top-lists">
        <div className="top-list">
          <h3>Top 5 Resources with Most Available Capacity</h3>
          {topAvailable.length > 0 ? (
            topAvailable.map((resource, index) => (
              <div key={resource.name} className="top-list-item">
                <div className="rank">{index + 1}</div>
                <div className="resource-info">
                  <div className="resource-name">{resource.name}</div>
                  <div className="resource-dept">{resource.department}</div>
                </div>
                <div className="resource-hours positive">
                  {resource.availableHours.toFixed(0)} hrs
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>No data available</p>
          )}
        </div>

        <div className="top-list">
          <h3>Top 5 Over-Utilized Resources</h3>
          {topOverUtilized.length > 0 ? (
            topOverUtilized.map((resource, index) => (
              <div key={resource.name} className="top-list-item">
                <div className="rank" style={{ backgroundColor: '#e74c3c' }}>{index + 1}</div>
                <div className="resource-info">
                  <div className="resource-name">{resource.name}</div>
                  <div className="resource-dept">{resource.department}</div>
                </div>
                <div className="resource-hours negative">
                  {resource.utilization.toFixed(0)}%
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>No over-utilized resources</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExecutiveSummary;
