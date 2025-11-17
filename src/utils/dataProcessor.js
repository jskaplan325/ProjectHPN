// Constants
export const ANNUAL_CAPACITY_HOURS = 1444;

/**
 * Parse a date string (M/D/YYYY or MM/DD/YYYY)
 */
function parseDate(dateString) {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Parse end quarter string (e.g., "2027, Q1" or "2027 Q1")
 */
function parseEndQuarter(quarterString) {
  if (!quarterString) return null;
  const match = quarterString.match(/(\d{4})[\s,]+Q(\d)/);
  if (!match) return null;

  const year = parseInt(match[1]);
  const quarter = parseInt(match[2]);

  // Return the last day of the quarter
  const monthMap = { 1: 2, 2: 5, 3: 8, 4: 11 }; // Last month of each quarter (0-indexed)
  const month = monthMap[quarter];

  // Get last day of that month
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, lastDay);
}

/**
 * Get the next N months from today
 */
function getNextMonths(count) {
  const today = new Date();
  const months = [];

  for (let i = 0; i < count; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    months.push({
      label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      startDate: new Date(date.getFullYear(), date.getMonth(), 1),
      endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0)
    });
  }

  return months;
}

/**
 * Get the next N quarters from today
 */
function getNextQuarters(count) {
  const today = new Date();
  const currentQuarter = Math.floor(today.getMonth() / 3);
  const quarters = [];

  for (let i = 0; i < count; i++) {
    const quarterOffset = currentQuarter + i;
    const year = today.getFullYear() + Math.floor(quarterOffset / 4);
    const quarter = (quarterOffset % 4) + 1;

    const startMonth = (quarter - 1) * 3;
    const endMonth = startMonth + 2;

    quarters.push({
      label: `${year} Q${quarter}`,
      startDate: new Date(year, startMonth, 1),
      endDate: new Date(year, endMonth + 1, 0)
    });
  }

  return quarters;
}

/**
 * Check if a project is active during a time period
 */
function isProjectActive(project, periodStart, periodEnd) {
  const projectStart = parseDate(project['Planned Start Date']);
  const projectEnd = parseEndQuarter(project['Planned End Quarter']);

  if (!projectStart || !projectEnd) return false;

  // Project is active if there's any overlap with the period
  return projectStart <= periodEnd && projectEnd >= periodStart;
}

/**
 * Calculate hours per month for a project (total hours / duration in months)
 */
function getMonthlyHours(totalHours, durationMonths) {
  const duration = parseFloat(durationMonths) || 1;
  return totalHours / duration;
}

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
    const name = (member.Name || '').trim();
    if (name) {
      resourceMap.set(name, {
        name: name,
        department: (member.Department || '').trim(),
        allocatedHours: 0,
        projects: []
      });
    }
  });

  // Process project data and allocate hours to resources
  projectData.forEach(project => {
    // Process Project Manager
    const pmName = (project['Project Manager'] || '').trim();
    if (pmName && resourceMap.has(pmName)) {
      const pmHours = parseFloat(project['Project Manager Hours']) || 0;
      const resource = resourceMap.get(pmName);
      resource.allocatedHours += pmHours;
      resource.projects.push({
        initiative: (project.Initiative || '').trim(),
        hours: pmHours,
        role: 'Project Manager'
      });
    }

    // Process all resource columns (Resource 1, Resource 2, etc.)
    Object.keys(project).forEach(key => {
      if (key.startsWith('Resource ') && !key.includes('Hours')) {
        const resourceName = (project[key] || '').trim();
        const hoursKey = key + ' Hours';
        const hours = parseFloat(project[hoursKey]) || 0;

        if (resourceName && resourceMap.has(resourceName) && hours > 0) {
          const resource = resourceMap.get(resourceName);
          resource.allocatedHours += hours;
          resource.projects.push({
            initiative: (project.Initiative || '').trim(),
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
    ['Engineering', 'Johnson, Michael'],
    ['Engineering', 'Williams, Jennifer'],
    ['Engineering', 'Brown, David'],
    ['Engineering', 'Davis, Emily'],
    ['Engineering', 'Miller, Robert'],
    ['Product', 'Wilson, Lisa'],
    ['Product', 'Moore, James'],
    ['Product', 'Taylor, Amanda'],
    ['Product', 'Anderson, Christopher'],
    ['Marketing', 'Thomas, Michelle'],
    ['Marketing', 'Jackson, Daniel'],
    ['Marketing', 'White, Jessica'],
    ['Marketing', 'Harris, Matthew'],
    ['Operations', 'Martin, Ashley'],
    ['Operations', 'Thompson, Kevin'],
    ['Operations', 'Garcia, Rachel'],
    ['Operations', 'Martinez, Brian'],
    ['Sales', 'Robinson, Nicole'],
    ['Sales', 'Clark, Steven'],
    ['Sales', 'Rodriguez, Lauren'],
    ['Sales', 'Lewis, Andrew'],
    ['Finance', 'Lee, Stephanie'],
    ['Finance', 'Walker, Ryan'],
    ['Finance', 'Hall, Megan'],
    ['HR', 'Allen, Joshua'],
    ['HR', 'Young, Rebecca'],
    ['IT', 'King, Eric'],
    ['IT', 'Wright, Samantha']
  ];

  return [headers, ...sampleData]
    .map(row => row.map(cell => `"${cell}"`).join(','))
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

  // Team members from roster
  const engineeringMembers = [
    'Smith, John', 'Jones, Sarah', 'Johnson, Michael', 'Williams, Jennifer',
    'Brown, David', 'Davis, Emily', 'Miller, Robert'
  ];

  const otherMembers = [
    'Wilson, Lisa', 'Moore, James', 'Taylor, Amanda', 'Anderson, Christopher',
    'Thomas, Michelle', 'Jackson, Daniel', 'White, Jessica', 'Harris, Matthew',
    'Martin, Ashley', 'Thompson, Kevin', 'Garcia, Rachel', 'Martinez, Brian',
    'Robinson, Nicole', 'Clark, Steven', 'Rodriguez, Lauren', 'Lewis, Andrew',
    'Lee, Stephanie', 'Walker, Ryan', 'Hall, Megan', 'Allen, Joshua',
    'Young, Rebecca', 'King, Eric', 'Wright, Samantha'
  ];

  const allMembers = [...engineeringMembers, ...otherMembers];

  // Project name templates
  const projectTypes = [
    'Implementation', 'Migration', 'Upgrade', 'Integration', 'Development',
    'Optimization', 'Enhancement', 'Rollout', 'Deployment', 'Modernization'
  ];

  const projectAreas = [
    'CRM System', 'ERP Platform', 'Cloud Infrastructure', 'Data Warehouse',
    'Mobile App', 'API Gateway', 'Analytics Platform', 'Security Framework',
    'Customer Portal', 'Payment System', 'Inventory Management', 'HR Portal',
    'Marketing Automation', 'Sales Dashboard', 'Supply Chain', 'Business Intelligence',
    'Content Management', 'E-commerce Platform', 'Collaboration Tools', 'DevOps Pipeline'
  ];

  const phases = ['Phase I', 'Phase II', 'Phase III', 'v2.0', 'v3.0', ''];

  // Helper function to get random item from array
  const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Helper function to get random int between min and max
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Helper function to calculate end quarter
  const calculateEndQuarter = (startDate, durationMonths) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + durationMonths);
    const year = date.getFullYear();
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `${year}, Q${quarter}`;
  };

  // Helper function to generate random date in 2025-2026
  const randomDate = () => {
    const year = randomInt(2025, 2026);
    const month = randomInt(1, 12);
    const day = randomInt(1, 28);
    return `${month}/${day}/${year}`;
  };

  const sampleData = [];
  const usedProjectNames = new Set();

  for (let i = 0; i < 100; i++) {
    // Generate unique project name
    let projectName;
    do {
      const area = random(projectAreas);
      const type = random(projectTypes);
      const phase = random(phases);
      projectName = phase ? `${area} ${type} (${phase})` : `${area} ${type}`;
    } while (usedProjectNames.has(projectName));
    usedProjectNames.add(projectName);

    // Random duration between 1 and 18 months
    const duration = randomInt(1, 18);

    // Random start date
    const startDate = randomDate();

    // Calculate end quarter
    const endQuarter = calculateEndQuarter(startDate, duration);

    // More balanced distribution: 35% chance to use Engineering PM for first 30 projects
    let pm;
    if (i < 30 && Math.random() < 0.35) {
      pm = random(engineeringMembers);
    } else {
      pm = random(allMembers);
    }

    // PM hours: More balanced (45-55 for everyone with slight variation)
    const pmHoursPerMonth = randomInt(45, 55);
    const pmHours = pmHoursPerMonth * duration;

    // Randomly assign 0-3 additional resources with balanced distribution
    const numResources = randomInt(0, 3);
    const assignedResources = [];
    const availableResources = allMembers.filter(m => m !== pm);

    for (let j = 0; j < numResources; j++) {
      if (availableResources.length > 0) {
        let resource;
        // 40% chance to pick from Engineering for first 30 projects (more balanced)
        if (i < 30 && Math.random() < 0.4) {
          const availableEng = availableResources.filter(m => engineeringMembers.includes(m));
          if (availableEng.length > 0) {
            resource = random(availableEng);
          } else {
            resource = random(availableResources);
          }
        } else {
          resource = random(availableResources);
        }

        // Remove from available list for this project
        const idx = availableResources.indexOf(resource);
        if (idx > -1) {
          availableResources.splice(idx, 1);
        }

        const hoursPerMonth = randomInt(45, 55);
        assignedResources.push({
          name: resource,
          hours: hoursPerMonth * duration
        });
      }
    }

    // Build row with up to 5 resource slots
    const row = [
      projectName,
      startDate,
      endQuarter,
      duration.toString(),
      pm,
      pmHours.toString()
    ];

    // Add assigned resources
    for (let j = 0; j < 5; j++) {
      if (j < assignedResources.length) {
        row.push(assignedResources[j].name);
        row.push(assignedResources[j].hours.toString());
      } else {
        row.push('');
        row.push('');
      }
    }

    sampleData.push(row);
  }

  return [headers, ...sampleData]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}

/**
 * Process department view with timeline projections
 */
export function processDepartmentView(teamRoster, projectData) {
  if (!teamRoster || !projectData) {
    return null;
  }

  // Group resources by department
  const departmentMap = new Map();
  teamRoster.forEach(member => {
    const deptName = (member.Department || '').trim();
    const resourceName = (member.Name || '').trim();

    if (!deptName || !resourceName) return;

    if (!departmentMap.has(deptName)) {
      departmentMap.set(deptName, {
        name: deptName,
        resources: [],
        totalCapacity: 0,
        allocatedHours: 0,
        projects: []
      });
    }
    const dept = departmentMap.get(deptName);
    dept.resources.push(resourceName);
    dept.totalCapacity += ANNUAL_CAPACITY_HOURS;
  });

  // Get timeline periods
  const nextMonths = getNextMonths(3);
  const nextQuarters = getNextQuarters(3);

  // Process projects and allocate to departments
  projectData.forEach(project => {
    const duration = parseFloat(project['Duration (Mth)']) || 1;

    // Helper to add project allocation to department
    const addToDepartment = (resourceName, hours, role) => {
      const trimmedName = resourceName.trim();
      const member = teamRoster.find(m => (m.Name || '').trim() === trimmedName);
      if (!member) return;

      const deptName = (member.Department || '').trim();
      const dept = departmentMap.get(deptName);
      if (!dept) return;

      dept.allocatedHours += hours;

      // Add to department's project list if not already there
      const initiative = (project.Initiative || '').trim();
      const existingProject = dept.projects.find(p => p.initiative === initiative);
      if (!existingProject) {
        dept.projects.push({
          initiative: initiative,
          startDate: project['Planned Start Date'],
          endQuarter: project['Planned End Quarter'],
          duration: duration,
          totalHours: hours,
          resources: [{ name: trimmedName, hours, role }]
        });
      } else {
        existingProject.totalHours += hours;
        existingProject.resources.push({ name: trimmedName, hours, role });
      }
    };

    // Process Project Manager
    const pmName = (project['Project Manager'] || '').trim();
    if (pmName) {
      const pmHours = parseFloat(project['Project Manager Hours']) || 0;
      addToDepartment(pmName, pmHours, 'Project Manager');
    }

    // Process all resources
    Object.keys(project).forEach(key => {
      if (key.startsWith('Resource ') && !key.includes('Hours')) {
        const resourceName = (project[key] || '').trim();
        const hoursKey = key + ' Hours';
        const hours = parseFloat(project[hoursKey]) || 0;

        if (resourceName && hours > 0) {
          addToDepartment(resourceName, hours, key);
        }
      }
    });
  });

  // Calculate timeline projections for each department
  const departments = Array.from(departmentMap.values()).map(dept => {
    const utilization = (dept.allocatedHours / dept.totalCapacity) * 100;
    const availableHours = dept.totalCapacity - dept.allocatedHours;

    // Calculate monthly projections
    const monthlyProjections = nextMonths.map(month => {
      let allocatedInMonth = 0;

      // Find all projects active in this month
      dept.projects.forEach(project => {
        if (isProjectActive(project, month.startDate, month.endDate)) {
          const monthlyHours = getMonthlyHours(project.totalHours, project.duration);
          allocatedInMonth += monthlyHours;
        }
      });

      // Monthly capacity is annual capacity / 12
      const monthlyCapacity = dept.totalCapacity / 12;
      const monthUtilization = (allocatedInMonth / monthlyCapacity) * 100;

      return {
        period: month.label,
        allocatedHours: allocatedInMonth,
        capacity: monthlyCapacity,
        utilization: monthUtilization,
        availableHours: monthlyCapacity - allocatedInMonth
      };
    });

    // Calculate quarterly projections
    const quarterlyProjections = nextQuarters.map(quarter => {
      let allocatedInQuarter = 0;

      // Find all projects active in this quarter
      dept.projects.forEach(project => {
        if (isProjectActive(project, quarter.startDate, quarter.endDate)) {
          const monthlyHours = getMonthlyHours(project.totalHours, project.duration);
          // Quarter has 3 months
          allocatedInQuarter += monthlyHours * 3;
        }
      });

      // Quarterly capacity is annual capacity / 4
      const quarterlyCapacity = dept.totalCapacity / 4;
      const quarterUtilization = (allocatedInQuarter / quarterlyCapacity) * 100;

      return {
        period: quarter.label,
        allocatedHours: allocatedInQuarter,
        capacity: quarterlyCapacity,
        utilization: quarterUtilization,
        availableHours: quarterlyCapacity - allocatedInQuarter
      };
    });

    return {
      ...dept,
      resourceCount: dept.resources.length,
      utilization,
      availableHours,
      monthlyProjections,
      quarterlyProjections
    };
  });

  return departments;
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
