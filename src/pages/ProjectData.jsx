import React from 'react';

function ProjectData({ projectData }) {
  if (!projectData || projectData.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Project Data</h3>
        <p>Please upload a Project Data CSV file to view projects.</p>
      </div>
    );
  }

  // Extract all unique resource columns
  const resourceColumns = [];
  if (projectData.length > 0) {
    Object.keys(projectData[0]).forEach(key => {
      if (key.startsWith('Resource ') && !key.includes('Hours')) {
        resourceColumns.push(key);
      }
    });
  }

  return (
    <div className="data-table">
      <h2>Project Data</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Initiative</th>
              <th>Start Date</th>
              <th>End Quarter</th>
              <th>Duration (Mth)</th>
              <th>Project Manager</th>
              <th>PM Hours</th>
              {resourceColumns.map(col => (
                <React.Fragment key={col}>
                  <th>{col}</th>
                  <th>{col} Hours</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {projectData.map((project, index) => (
              <tr key={index}>
                <td>{project.Initiative}</td>
                <td>{project['Planned Start Date']}</td>
                <td>{project['Planned End Quarter']}</td>
                <td>{project['Duration (Mth)']}</td>
                <td>{project['Project Manager']}</td>
                <td>{project['Project Manager Hours']}</td>
                {resourceColumns.map(col => (
                  <React.Fragment key={col}>
                    <td>{project[col]}</td>
                    <td>{project[col + ' Hours']}</td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProjectData;
