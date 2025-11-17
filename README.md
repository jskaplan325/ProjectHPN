# Resource & Capacity Planning Tool

A comprehensive web-based tool for managing team resources and capacity planning. This application helps organizations track resource utilization, identify over/under-utilized team members, and optimize project staffing.

## Features

### Executive Summary
- Total active resources count
- Total annual capacity (in hours)
- Total allocated hours
- Total available hours
- Overall utilization percentage
- Over-utilization and under-utilization metrics
- Top 5 resources with most available capacity
- Top 5 over-utilized resources

### Team Roster View
- Complete list of team members
- Department organization
- Easy-to-read table format

### Project Data View
- All active projects and initiatives
- Project timelines and durations
- Resource assignments per project
- Hours allocated to each resource

### Individual Capacity Analysis
- Detailed per-person capacity metrics
- Annual capacity vs. allocated hours
- Available hours remaining
- Utilization percentage
- Status indicators (optimal, under-utilized, over-utilized)
- Project assignments for each resource
- Sortable columns for easy analysis

## Capacity Calculations

The tool is based on **1,444 hours** of annual capacity per resource.

- **Utilization %** = (Allocated Hours / Annual Capacity) × 100
- **Available Hours** = Annual Capacity - Allocated Hours
- **Status:**
  - **Over-Utilized**: Utilization > 100%
  - **Under-Utilized**: Utilization < 80%
  - **Optimal**: Utilization between 80% and 100%

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

### Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## Usage

### 1. Download CSV Templates

Click the template download buttons to get properly formatted CSV files:
- **Team Roster Template**: Contains Department and Name columns
- **Project Data Template**: Contains project details and resource allocation columns

### 2. Prepare Your Data

#### Team Roster CSV Format:
```csv
Department,Name
Engineering,Smith, John
Marketing,Brown, Michael
Operations,Davis, Emily
```

**Important**: Names should be in "Last, First" format.

#### Project Data CSV Format:
```csv
Initiative,Planned Start Date,Planned End Quarter,Duration (Mth),Project Manager,Project Manager Hours,Resource 1,Resource 1 Hours,Resource 2,Resource 2 Hours,...
KEConnect SPO Implementation,8/31/2025,2027 Q1,5,Stone Katie,120,Smith John,200,Jones Sarah,150,...
```

**Note**: The tool supports flexible resource columns. You can have as many "Resource X" and "Resource X Hours" columns as needed.

### 3. Upload Your Data

- Click "Choose File" under Team Roster to upload your team data
- Click "Choose File" under Project Data to upload your project assignments
- The dashboard will automatically calculate and display all metrics

### 4. Navigate Between Views

Use the navigation menu to switch between:
- **Executive Summary**: High-level metrics and insights
- **Team Roster**: View all team members
- **Project Data**: See all projects and assignments
- **Individual Capacity**: Detailed per-person analysis

## Key Insights

The tool helps you:
- **Identify bottlenecks**: See which resources are over-allocated
- **Optimize staffing**: Find resources with available capacity for new projects
- **Balance workload**: Ensure fair distribution of work across the team
- **Plan ahead**: Make data-driven decisions about hiring and project staffing

## Technology Stack

- **React 18**: Modern UI framework
- **React Router**: Client-side routing
- **PapaParse**: CSV parsing library
- **Vite**: Fast build tool and dev server

## Project Structure

```
ProjectHPN/
├── src/
│   ├── components/
│   │   └── FileUpload.jsx      # CSV file upload component
│   ├── pages/
│   │   ├── ExecutiveSummary.jsx
│   │   ├── TeamRoster.jsx
│   │   ├── ProjectData.jsx
│   │   └── IndividualCapacity.jsx
│   ├── utils/
│   │   └── dataProcessor.js     # Capacity calculation logic
│   ├── App.jsx                  # Main application component
│   ├── main.jsx                 # Application entry point
│   └── index.css                # Styling
├── index.html
├── package.json
└── vite.config.js
```

## Troubleshooting

### CSV File Not Loading
- Ensure your CSV file is properly formatted
- Check that column names match the expected format
- Verify there are no special characters causing parsing issues

### Incorrect Calculations
- Verify that resource names in Project Data exactly match those in Team Roster
- Ensure hour values are numeric (no text or special characters)
- Check that the "Last, First" name format is consistent

### Data Not Updating
- Make sure both Team Roster and Project Data files are uploaded
- Refresh the page and re-upload if calculations seem incorrect

## License

This project is proprietary software.
