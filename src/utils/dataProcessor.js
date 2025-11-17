// Constants
export const ANNUAL_CAPACITY_HOURS = 1444;

/**
 * Process team roster and project data to calculate capacity metrics
 */
export function processCapacityData(teamRoster, projectData) {
  if (!teamRoster || !projectData) {
    return null;
  }

  // Create a map of resources with their departments
  const resourceMap = new Map();
  teamRoster.forEach(member => {
    resourceMap.set(member.Name, {
      name: member.Name,
      department: member.Department,
      allocatedHours: 0,
      projects: []
    });
  });

  // Process project data and allocate hours to resources
  projectData.forEach(project => {
    // Process Project Manager
    if (project['Project Manager'] && resourceMap.has(project['Project Manager'])) {
      const pmHours = parseFloat(project['Project Manager Hours']) || 0;
      const resource = resourceMap.get(project['Project Manager']);
      resource.allocatedHours += pmHours;
      resource.projects.push({
        initiative: project.Initiative,
        hours: pmHours,
        role: 'Project Manager'
      });
    }

    // Process all resource columns (Resource 1, Resource 2, etc.)
    Object.keys(project).forEach(key => {
      if (key.startsWith('Resource ') && !key.includes('Hours')) {
        const resourceName = project[key];
        const hoursKey = key + ' Hours';
        const hours = parseFloat(project[hoursKey]) || 0;

        if (resourceName && resourceMap.has(resourceName) && hours > 0) {
          const resource = resourceMap.get(resourceName);
          resource.allocatedHours += hours;
          resource.projects.push({
            initiative: project.Initiative,
            hours: hours,
            role: key
          });
        }
      }
    });
  });

  // Calculate metrics for each resource
  const individualCapacity = Array.from(resourceMap.values()).map(resource => {
    const availableHours = ANNUAL_CAPACITY_HOURS - resource.allocatedHours;
    const utilization = (resource.allocatedHours / ANNUAL_CAPACITY_HOURS) * 100;

    let status = 'optimal';
    if (utilization > 100) {
      status = 'over-utilized';
    } else if (utilization < 80) {
      status = 'under-utilized';
    }

    return {
      ...resource,
      annualCapacity: ANNUAL_CAPACITY_HOURS,
      availableHours,
      utilization,
      status
    };
  });

  // Calculate executive summary metrics
  const totalResources = individualCapacity.length;
  const totalAnnualCapacity = totalResources * ANNUAL_CAPACITY_HOURS;
  const totalAllocatedHours = individualCapacity.reduce((sum, r) => sum + r.allocatedHours, 0);
  const totalAvailableHours = totalAnnualCapacity - totalAllocatedHours;
  const overallUtilization = (totalAllocatedHours / totalAnnualCapacity) * 100;

  const overUtilizedCount = individualCapacity.filter(r => r.status === 'over-utilized').length;
  const underUtilizedCount = individualCapacity.filter(r => r.status === 'under-utilized').length;

  // Get top 5 most available (highest available hours)
  const topAvailable = [...individualCapacity]
    .sort((a, b) => b.availableHours - a.availableHours)
    .slice(0, 5);

  // Get top 5 over-utilized (highest utilization %)
  const topOverUtilized = [...individualCapacity]
    .filter(r => r.utilization > 100)
    .sort((a, b) => b.utilization - a.utilization)
    .slice(0, 5);

  return {
    executiveSummary: {
      totalResources,
      totalAnnualCapacity,
      totalAllocatedHours,
      totalAvailableHours,
      overallUtilization,
      overUtilizedCount,
      underUtilizedCount,
      topAvailable,
      topOverUtilized
    },
    individualCapacity
  };
}

/**
 * Generate sample CSV content for Team Roster template
 */
export function generateTeamRosterTemplate() {
  const headers = ['Department', 'Name'];
  const sampleData = [
    ['Engineering', 'Smith, John'],
    ['Engineering', 'Jones, Sarah'],
    ['Marketing', 'Brown, Michael'],
    ['Operations', 'Davis, Emily'],
    ['Engineering', 'Stone, Katie']
  ];

  return [headers, ...sampleData]
    .map(row => row.join(','))
    .join('\n');
}

/**
 * Generate sample CSV content for Project Data template
 */
export function generateProjectDataTemplate() {
  const headers = [
    'Initiative',
    'Planned Start Date',
    'Planned End Quarter',
    'Duration (Mth)',
    'Project Manager',
    'Project Manager Hours',
    'Resource 1',
    'Resource 1 Hours',
    'Resource 2',
    'Resource 2 Hours',
    'Resource 3',
    'Resource 3 Hours',
    'Resource 4',
    'Resource 4 Hours',
    'Resource 5',
    'Resource 5 Hours'
  ];

  const sampleData = [
    [
      'KEConnect SPO Implementation (Phase I)',
      '8/31/2025',
      '2027, Q1',
      '5',
      'Stone, Katie',
      '120',
      'Smith, John',
      '200',
      'Jones, Sarah',
      '150',
      '',
      '',
      '',
      '',
      '',
      ''
    ],
    [
      'KEConnect SPO Implementation (Phase II)',
      '3/31/2026',
      '2027, Q4',
      '7',
      'Stone, Katie',
      '168',
      'Smith, John',
      '280',
      'Brown, Michael',
      '100',
      '',
      '',
      '',
      '',
      '',
      ''
    ],
    [
      'Digital Transformation Initiative',
      '1/15/2025',
      '2025, Q4',
      '11',
      'Davis, Emily',
      '220',
      'Jones, Sarah',
      '400',
      'Smith, John',
      '350',
      'Brown, Michael',
      '180',
      '',
      '',
      '',
      ''
    ]
  ];

  return [headers, ...sampleData]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
