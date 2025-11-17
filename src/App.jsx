import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import FileUpload from './components/FileUpload';
import ExecutiveSummary from './pages/ExecutiveSummary';
import TeamRoster from './pages/TeamRoster';
import ProjectData from './pages/ProjectData';
import IndividualCapacity from './pages/IndividualCapacity';
import DepartmentView from './pages/DepartmentView';
import { processCapacityData, processDepartmentView, generateTeamRosterTemplate, generateProjectDataTemplate, downloadCSV } from './utils/dataProcessor';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="nav">
      <Link
        to="/"
        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
      >
        Executive Summary
      </Link>
      <Link
        to="/department-view"
        className={`nav-link ${location.pathname === '/department-view' ? 'active' : ''}`}
      >
        Department View
      </Link>
      <Link
        to="/team-roster"
        className={`nav-link ${location.pathname === '/team-roster' ? 'active' : ''}`}
      >
        Team Roster
      </Link>
      <Link
        to="/project-data"
        className={`nav-link ${location.pathname === '/project-data' ? 'active' : ''}`}
      >
        Project Data
      </Link>
      <Link
        to="/individual-capacity"
        className={`nav-link ${location.pathname === '/individual-capacity' ? 'active' : ''}`}
      >
        Individual Capacity
      </Link>
    </nav>
  );
}

function App() {
  const [teamRoster, setTeamRoster] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [teamRosterFileName, setTeamRosterFileName] = useState('');
  const [projectDataFileName, setProjectDataFileName] = useState('');
  const [processedData, setProcessedData] = useState(null);
  const [departmentData, setDepartmentData] = useState(null);

  const handleTeamRosterLoaded = (data, fileName) => {
    setTeamRoster(data);
    setTeamRosterFileName(fileName);
    if (projectData) {
      setProcessedData(processCapacityData(data, projectData));
      setDepartmentData(processDepartmentView(data, projectData));
    }
  };

  const handleProjectDataLoaded = (data, fileName) => {
    setProjectData(data);
    setProjectDataFileName(fileName);
    if (teamRoster) {
      setProcessedData(processCapacityData(teamRoster, data));
      setDepartmentData(processDepartmentView(teamRoster, data));
    }
  };

  const handleDownloadTeamRosterTemplate = () => {
    const content = generateTeamRosterTemplate();
    downloadCSV(content, 'team_roster_template.csv');
  };

  const handleDownloadProjectDataTemplate = () => {
    const content = generateProjectDataTemplate();
    downloadCSV(content, 'project_data_template.csv');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This will clear all uploaded files and calculations.')) {
      setTeamRoster(null);
      setProjectData(null);
      setTeamRosterFileName('');
      setProjectDataFileName('');
      setProcessedData(null);
      setDepartmentData(null);
    }
  };

  return (
    <Router>
      <div className="app">
        <header className="header">
          <h1>Resource & Capacity Planning Tool</h1>
        </header>

        <Navigation />

        <main className="main-content">
          <div className="upload-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Data Upload</h2>
              {(teamRoster || projectData) && (
                <button className="reset-button" onClick={handleReset}>
                  Reset All Data
                </button>
              )}
            </div>
            <div className="upload-grid">
              <FileUpload
                key={`team-${teamRosterFileName}`}
                title="Team Roster"
                onDataLoaded={handleTeamRosterLoaded}
                fileName={teamRosterFileName}
              />
              <FileUpload
                key={`project-${projectDataFileName}`}
                title="Project Data"
                onDataLoaded={handleProjectDataLoaded}
                fileName={projectDataFileName}
              />
            </div>

            <div className="template-section">
              <p>Need templates? Download sample CSV files:</p>
              <div className="template-buttons">
                <button className="template-button" onClick={handleDownloadTeamRosterTemplate}>
                  Download Team Roster Template
                </button>
                <button className="template-button" onClick={handleDownloadProjectDataTemplate}>
                  Download Project Data Template
                </button>
              </div>
            </div>
          </div>

          <Routes>
            <Route path="/" element={<ExecutiveSummary data={processedData} />} />
            <Route path="/department-view" element={<DepartmentView departments={departmentData} />} />
            <Route path="/team-roster" element={<TeamRoster teamRoster={teamRoster} />} />
            <Route path="/project-data" element={<ProjectData projectData={projectData} />} />
            <Route path="/individual-capacity" element={<IndividualCapacity data={processedData} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
