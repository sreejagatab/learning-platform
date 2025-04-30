/**
 * Dependency Vulnerability Check
 * 
 * This script runs npm audit on both server and client packages
 * and generates a report of vulnerabilities.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create reports directory if it doesn't exist
const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Function to run npm audit and save the report
function runAudit(directory, reportName) {
  console.log(`Running npm audit in ${directory}...`);
  
  try {
    // Run npm audit and get the output
    const auditOutput = execSync('npm audit --json', {
      cwd: path.join(process.cwd(), directory),
      encoding: 'utf8'
    });
    
    // Parse the JSON output
    const auditData = JSON.parse(auditOutput);
    
    // Save the full JSON report
    fs.writeFileSync(
      path.join(reportsDir, `${reportName}-full.json`),
      JSON.stringify(auditData, null, 2)
    );
    
    // Generate a summary report
    const vulnerabilities = auditData.vulnerabilities || {};
    const summary = {
      totalVulnerabilities: auditData.metadata?.vulnerabilities?.total || 0,
      critical: auditData.metadata?.vulnerabilities?.critical || 0,
      high: auditData.metadata?.vulnerabilities?.high || 0,
      moderate: auditData.metadata?.vulnerabilities?.moderate || 0,
      low: auditData.metadata?.vulnerabilities?.low || 0,
      info: auditData.metadata?.vulnerabilities?.info || 0,
      details: Object.keys(vulnerabilities).map(pkg => ({
        package: pkg,
        severity: vulnerabilities[pkg].severity,
        via: vulnerabilities[pkg].via,
        effects: vulnerabilities[pkg].effects,
        fixAvailable: vulnerabilities[pkg].fixAvailable
      }))
    };
    
    // Save the summary report
    fs.writeFileSync(
      path.join(reportsDir, `${reportName}-summary.json`),
      JSON.stringify(summary, null, 2)
    );
    
    // Generate HTML report
    const htmlReport = generateHtmlReport(summary, directory);
    fs.writeFileSync(
      path.join(reportsDir, `${reportName}.html`),
      htmlReport
    );
    
    console.log(`Audit completed for ${directory}. Reports saved to security-tests/reports/`);
    return summary;
  } catch (error) {
    console.error(`Error running npm audit in ${directory}:`, error.message);
    
    // Try to parse the error output as JSON
    try {
      const errorData = JSON.parse(error.stdout);
      
      // Save the error report
      fs.writeFileSync(
        path.join(reportsDir, `${reportName}-error.json`),
        JSON.stringify(errorData, null, 2)
      );
      
      // Generate a summary report from the error data
      const vulnerabilities = errorData.vulnerabilities || {};
      const summary = {
        totalVulnerabilities: errorData.metadata?.vulnerabilities?.total || 0,
        critical: errorData.metadata?.vulnerabilities?.critical || 0,
        high: errorData.metadata?.vulnerabilities?.high || 0,
        moderate: errorData.metadata?.vulnerabilities?.moderate || 0,
        low: errorData.metadata?.vulnerabilities?.low || 0,
        info: errorData.metadata?.vulnerabilities?.info || 0,
        details: Object.keys(vulnerabilities).map(pkg => ({
          package: pkg,
          severity: vulnerabilities[pkg].severity,
          via: vulnerabilities[pkg].via,
          effects: vulnerabilities[pkg].effects,
          fixAvailable: vulnerabilities[pkg].fixAvailable
        }))
      };
      
      // Save the summary report
      fs.writeFileSync(
        path.join(reportsDir, `${reportName}-summary.json`),
        JSON.stringify(summary, null, 2)
      );
      
      // Generate HTML report
      const htmlReport = generateHtmlReport(summary, directory);
      fs.writeFileSync(
        path.join(reportsDir, `${reportName}.html`),
        htmlReport
      );
      
      console.log(`Audit completed with vulnerabilities for ${directory}. Reports saved to security-tests/reports/`);
      return summary;
    } catch (parseError) {
      console.error('Failed to parse npm audit output:', parseError.message);
      
      // Save the raw error output
      fs.writeFileSync(
        path.join(reportsDir, `${reportName}-error.txt`),
        error.stdout || error.message
      );
      
      return {
        totalVulnerabilities: 0,
        critical: 0,
        high: 0,
        moderate: 0,
        low: 0,
        info: 0,
        details: [],
        error: error.message
      };
    }
  }
}

// Function to generate HTML report
function generateHtmlReport(summary, directory) {
  const severityColors = {
    critical: '#cc0000',
    high: '#ff4444',
    moderate: '#ff8800',
    low: '#ffcc00',
    info: '#44aaff'
  };
  
  const detailsHtml = summary.details.map(detail => {
    const via = Array.isArray(detail.via) 
      ? detail.via.map(v => typeof v === 'string' ? v : v.title || v.url || JSON.stringify(v)).join(', ')
      : typeof detail.via === 'string' ? detail.via : JSON.stringify(detail.via);
    
    const effects = Array.isArray(detail.effects) ? detail.effects.join(', ') : '';
    const fixAvailable = detail.fixAvailable === true 
      ? 'Yes' 
      : detail.fixAvailable === false 
        ? 'No' 
        : typeof detail.fixAvailable === 'object' 
          ? (detail.fixAvailable.name ? `Yes (${detail.fixAvailable.name}@${detail.fixAvailable.version})` : 'Yes')
          : 'Unknown';
    
    return `
      <tr>
        <td>${detail.package}</td>
        <td style="color: ${severityColors[detail.severity] || '#000'}">${detail.severity}</td>
        <td>${via}</td>
        <td>${effects}</td>
        <td>${fixAvailable}</td>
      </tr>
    `;
  }).join('');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dependency Vulnerability Report - ${directory}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        h1, h2 {
          color: #2c3e50;
        }
        .summary {
          background-color: #f8f9fa;
          border-radius: 5px;
          padding: 15px;
          margin-bottom: 20px;
        }
        .summary-item {
          display: inline-block;
          margin-right: 20px;
          padding: 10px;
          border-radius: 5px;
          text-align: center;
          min-width: 100px;
        }
        .critical { background-color: #ffdddd; color: #cc0000; }
        .high { background-color: #ffeeee; color: #ff4444; }
        .moderate { background-color: #fff6e6; color: #ff8800; }
        .low { background-color: #fffae6; color: #ffcc00; }
        .info { background-color: #e6f5ff; color: #44aaff; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          padding: 12px 15px;
          border-bottom: 1px solid #ddd;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        tr:hover {
          background-color: #f5f5f5;
        }
        .timestamp {
          color: #666;
          font-size: 0.9em;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <h1>Dependency Vulnerability Report</h1>
      <h2>${directory}</h2>
      
      <div class="summary">
        <h3>Summary</h3>
        <div class="summary-item critical">
          <div>Critical</div>
          <strong>${summary.critical}</strong>
        </div>
        <div class="summary-item high">
          <div>High</div>
          <strong>${summary.high}</strong>
        </div>
        <div class="summary-item moderate">
          <div>Moderate</div>
          <strong>${summary.moderate}</strong>
        </div>
        <div class="summary-item low">
          <div>Low</div>
          <strong>${summary.low}</strong>
        </div>
        <div class="summary-item info">
          <div>Info</div>
          <strong>${summary.info}</strong>
        </div>
      </div>
      
      <h3>Vulnerability Details</h3>
      ${summary.details.length === 0 ? '<p>No vulnerabilities found.</p>' : `
        <table>
          <thead>
            <tr>
              <th>Package</th>
              <th>Severity</th>
              <th>Via</th>
              <th>Effects</th>
              <th>Fix Available</th>
            </tr>
          </thead>
          <tbody>
            ${detailsHtml}
          </tbody>
        </table>
      `}
      
      <p class="timestamp">Report generated on ${new Date().toLocaleString()}</p>
    </body>
    </html>
  `;
}

// Run audits
console.log('Starting dependency vulnerability check...');

const serverSummary = runAudit('server', 'server-audit');
const clientSummary = runAudit('client', 'client-audit');

// Generate combined report
const combinedSummary = {
  totalVulnerabilities: serverSummary.totalVulnerabilities + clientSummary.totalVulnerabilities,
  critical: serverSummary.critical + clientSummary.critical,
  high: serverSummary.high + clientSummary.high,
  moderate: serverSummary.moderate + clientSummary.moderate,
  low: serverSummary.low + clientSummary.low,
  info: serverSummary.info + clientSummary.info,
  details: [
    ...serverSummary.details.map(detail => ({ ...detail, component: 'server' })),
    ...clientSummary.details.map(detail => ({ ...detail, component: 'client' }))
  ]
};

// Save combined summary
fs.writeFileSync(
  path.join(reportsDir, 'combined-audit-summary.json'),
  JSON.stringify(combinedSummary, null, 2)
);

// Generate combined HTML report
const combinedHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Combined Dependency Vulnerability Report</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 20px;
        color: #333;
      }
      h1, h2 {
        color: #2c3e50;
      }
      .summary {
        background-color: #f8f9fa;
        border-radius: 5px;
        padding: 15px;
        margin-bottom: 20px;
      }
      .summary-item {
        display: inline-block;
        margin-right: 20px;
        padding: 10px;
        border-radius: 5px;
        text-align: center;
        min-width: 100px;
      }
      .critical { background-color: #ffdddd; color: #cc0000; }
      .high { background-color: #ffeeee; color: #ff4444; }
      .moderate { background-color: #fff6e6; color: #ff8800; }
      .low { background-color: #fffae6; color: #ffcc00; }
      .info { background-color: #e6f5ff; color: #44aaff; }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th, td {
        padding: 12px 15px;
        border-bottom: 1px solid #ddd;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
        font-weight: bold;
      }
      tr:hover {
        background-color: #f5f5f5;
      }
      .timestamp {
        color: #666;
        font-size: 0.9em;
        margin-top: 30px;
      }
      .component-server {
        background-color: #e6f5ff;
      }
      .component-client {
        background-color: #e6ffe6;
      }
    </style>
  </head>
  <body>
    <h1>Combined Dependency Vulnerability Report</h1>
    
    <div class="summary">
      <h3>Summary</h3>
      <div class="summary-item critical">
        <div>Critical</div>
        <strong>${combinedSummary.critical}</strong>
      </div>
      <div class="summary-item high">
        <div>High</div>
        <strong>${combinedSummary.high}</strong>
      </div>
      <div class="summary-item moderate">
        <div>Moderate</div>
        <strong>${combinedSummary.moderate}</strong>
      </div>
      <div class="summary-item low">
        <div>Low</div>
        <strong>${combinedSummary.low}</strong>
      </div>
      <div class="summary-item info">
        <div>Info</div>
        <strong>${combinedSummary.info}</strong>
      </div>
    </div>
    
    <h2>Server Vulnerabilities</h2>
    ${serverSummary.details.length === 0 ? '<p>No vulnerabilities found.</p>' : `
      <table>
        <thead>
          <tr>
            <th>Package</th>
            <th>Severity</th>
            <th>Via</th>
            <th>Effects</th>
            <th>Fix Available</th>
          </tr>
        </thead>
        <tbody>
          ${serverSummary.details.map(detail => {
            const via = Array.isArray(detail.via) 
              ? detail.via.map(v => typeof v === 'string' ? v : v.title || v.url || JSON.stringify(v)).join(', ')
              : typeof detail.via === 'string' ? detail.via : JSON.stringify(detail.via);
            
            const effects = Array.isArray(detail.effects) ? detail.effects.join(', ') : '';
            const fixAvailable = detail.fixAvailable === true 
              ? 'Yes' 
              : detail.fixAvailable === false 
                ? 'No' 
                : typeof detail.fixAvailable === 'object' 
                  ? (detail.fixAvailable.name ? `Yes (${detail.fixAvailable.name}@${detail.fixAvailable.version})` : 'Yes')
                  : 'Unknown';
            
            return `
              <tr class="component-server">
                <td>${detail.package}</td>
                <td style="color: ${severityColors[detail.severity] || '#000'}">${detail.severity}</td>
                <td>${via}</td>
                <td>${effects}</td>
                <td>${fixAvailable}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `}
    
    <h2>Client Vulnerabilities</h2>
    ${clientSummary.details.length === 0 ? '<p>No vulnerabilities found.</p>' : `
      <table>
        <thead>
          <tr>
            <th>Package</th>
            <th>Severity</th>
            <th>Via</th>
            <th>Effects</th>
            <th>Fix Available</th>
          </tr>
        </thead>
        <tbody>
          ${clientSummary.details.map(detail => {
            const via = Array.isArray(detail.via) 
              ? detail.via.map(v => typeof v === 'string' ? v : v.title || v.url || JSON.stringify(v)).join(', ')
              : typeof detail.via === 'string' ? detail.via : JSON.stringify(detail.via);
            
            const effects = Array.isArray(detail.effects) ? detail.effects.join(', ') : '';
            const fixAvailable = detail.fixAvailable === true 
              ? 'Yes' 
              : detail.fixAvailable === false 
                ? 'No' 
                : typeof detail.fixAvailable === 'object' 
                  ? (detail.fixAvailable.name ? `Yes (${detail.fixAvailable.name}@${detail.fixAvailable.version})` : 'Yes')
                  : 'Unknown';
            
            return `
              <tr class="component-client">
                <td>${detail.package}</td>
                <td style="color: ${severityColors[detail.severity] || '#000'}">${detail.severity}</td>
                <td>${via}</td>
                <td>${effects}</td>
                <td>${fixAvailable}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `}
    
    <p class="timestamp">Report generated on ${new Date().toLocaleString()}</p>
  </body>
  </html>
`;

fs.writeFileSync(
  path.join(reportsDir, 'combined-audit.html'),
  combinedHtml
);

console.log('Dependency vulnerability check completed. Reports saved to security-tests/reports/');

// Exit with error code if critical or high vulnerabilities are found
if (combinedSummary.critical > 0 || combinedSummary.high > 0) {
  console.error(`Found ${combinedSummary.critical} critical and ${combinedSummary.high} high severity vulnerabilities.`);
  process.exit(1);
}

process.exit(0);
