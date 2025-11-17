import React, { useState } from 'react';

function IndividualCapacity({ data }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  if (!data) {
    return (
      <div className="empty-state">
        <h3>No Capacity Data</h3>
        <p>Please upload Team Roster and Project Data files to view individual capacity.</p>
      </div>
    );
  }

  const { individualCapacity } = data;

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...individualCapacity].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getStatusBadgeClass = (status) => {
    return `status-badge ${status}`;
  };

  const getStatusLabel = (status) => {
    if (status === 'over-utilized') return 'Over-Utilized';
    if (status === 'under-utilized') return 'Under-Utilized';
    return 'Optimal';
  };

  return (
    <div className="data-table">
      <h2>Individual Capacity Analysis</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('department')} style={{ cursor: 'pointer' }}>
                Department {sortConfig.key === 'department' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                Resource Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('annualCapacity')} style={{ cursor: 'pointer' }}>
                Annual Capacity {sortConfig.key === 'annualCapacity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('allocatedHours')} style={{ cursor: 'pointer' }}>
                Allocated Hours {sortConfig.key === 'allocatedHours' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('availableHours')} style={{ cursor: 'pointer' }}>
                Available Hours {sortConfig.key === 'availableHours' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('utilization')} style={{ cursor: 'pointer' }}>
                Utilization % {sortConfig.key === 'utilization' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Projects</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((resource, index) => (
              <tr key={index}>
                <td>{resource.department}</td>
                <td>{resource.name}</td>
                <td>{resource.annualCapacity.toLocaleString()} hrs</td>
                <td>{resource.allocatedHours.toFixed(0)} hrs</td>
                <td style={{ color: resource.availableHours < 0 ? '#e74c3c' : '#27ae60' }}>
                  {resource.availableHours.toFixed(0)} hrs
                </td>
                <td style={{
                  color: resource.utilization > 100 ? '#e74c3c' : '#2c3e50',
                  fontWeight: resource.utilization > 100 ? 'bold' : 'normal'
                }}>
                  {resource.utilization.toFixed(1)}%
                </td>
                <td>
                  <span className={getStatusBadgeClass(resource.status)}>
                    {getStatusLabel(resource.status)}
                  </span>
                </td>
                <td>
                  {resource.projects.length > 0 ? (
                    <details>
                      <summary style={{ cursor: 'pointer' }}>
                        {resource.projects.length} project(s)
                      </summary>
                      <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                        {resource.projects.map((project, idx) => (
                          <li key={idx} style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                            {project.initiative} - {project.hours} hrs
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <span style={{ color: '#7f8c8d' }}>No projects</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IndividualCapacity;
