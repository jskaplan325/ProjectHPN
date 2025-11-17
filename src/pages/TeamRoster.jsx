import React from 'react';

function TeamRoster({ teamRoster }) {
  if (!teamRoster || teamRoster.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Team Roster Data</h3>
        <p>Please upload a Team Roster CSV file to view team members.</p>
      </div>
    );
  }

  return (
    <div className="data-table">
      <h2>Team Roster</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {teamRoster.map((member, index) => (
              <tr key={index}>
                <td>{member.Department}</td>
                <td>{member.Name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TeamRoster;
