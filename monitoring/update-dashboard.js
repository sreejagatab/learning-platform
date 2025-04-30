/**
 * Dashboard Update Script
 * 
 * This script processes test results and updates the test dashboard with real data.
 * It reads test results from various sources and generates a data.js file that
 * the dashboard will load to display real-time metrics.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  // Paths to test results
  serverTestResults: path.join(__dirname, '../test-reports/server-test-results.json'),
  clientTestResults: path.join(__dirname, '../test-reports/client-test-results.json'),
  serverCoverage: path.join(__dirname, '../server/coverage/coverage-summary.json'),
  clientCoverage: path.join(__dirname, '../client/coverage/coverage-summary.json'),
  securityReport: path.join(__dirname, '../security-tests/reports/combined-audit-summary.json'),
  a11yReport: path.join(__dirname, '../e2e/cypress/a11y-results.json'),
  performanceReport: path.join(__dirname, '../performance-reports/results.json'),
  visualReport: path.join(__dirname, '../e2e/cypress/visual-results.json'),
  
  // History file to store previous results for trend analysis
  historyFile: path.join(__dirname, 'history.json'),
  
  // Output file
  outputFile: path.join(__dirname, 'data.js')
};

// Initialize history if it doesn't exist
if (!fs.existsSync(config.historyFile)) {
  fs.writeFileSync(config.historyFile, JSON.stringify({
    testResults: [],
    coverage: [],
    security: [],
    a11y: [],
    performance: [],
    visual: []
  }));
}

// Load history
const history = JSON.parse(fs.readFileSync(config.historyFile, 'utf8'));

// Function to safely read a JSON file
function safeReadJson(filePath, defaultValue = {}) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
  return defaultValue;
}

// Function to calculate trend
function calculateTrend(current, previous) {
  if (!previous) return { value: 0, direction: 'neutral' };
  
  const diff = current - previous;
  return {
    value: Math.abs(diff),
    direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral'
  };
}

// Process test results
function processTestResults() {
  console.log('Processing test results...');
  
  const serverResults = safeReadJson(config.serverTestResults);
  const clientResults = safeReadJson(config.clientTestResults);
  
  // If we don't have any results, try to run the tests
  if (Object.keys(serverResults).length === 0 || Object.keys(clientResults).length === 0) {
    try {
      console.log('No test results found. Running tests...');
      
      // Create test-reports directory if it doesn't exist
      if (!fs.existsSync(path.join(__dirname, '../test-reports'))) {
        fs.mkdirSync(path.join(__dirname, '../test-reports'), { recursive: true });
      }
      
      // Run server tests
      execSync('cd ../server && npx jest --json > ../test-reports/server-test-results.json', { stdio: 'inherit' });
      
      // Run client tests
      execSync('cd ../client && npx jest --json > ../test-reports/client-test-results.json', { stdio: 'inherit' });
      
      // Load the results again
      const serverResults = safeReadJson(config.serverTestResults);
      const clientResults = safeReadJson(config.clientTestResults);
    } catch (error) {
      console.error('Error running tests:', error.message);
    }
  }
  
  // Calculate totals
  const totalPassed = (serverResults.numPassedTests || 0) + (clientResults.numPassedTests || 0);
  const totalFailed = (serverResults.numFailedTests || 0) + (clientResults.numFailedTests || 0);
  const totalPending = (serverResults.numPendingTests || 0) + (clientResults.numPendingTests || 0);
  const totalDuration = 
    ((serverResults.testResults || []).reduce((acc, result) => acc + result.perfStats.runtime, 0) +
     (clientResults.testResults || []).reduce((acc, result) => acc + result.perfStats.runtime, 0)) / 1000;
  
  // Get previous results for trend calculation
  const previousResults = history.testResults.length > 0 ? history.testResults[history.testResults.length - 1] : null;
  
  const currentResults = {
    timestamp: new Date().toISOString(),
    passed: totalPassed,
    failed: totalFailed,
    pending: totalPending,
    duration: totalDuration
  };
  
  // Calculate trends
  const passedTrend = calculateTrend(totalPassed, previousResults?.passed);
  const failedTrend = calculateTrend(totalFailed, previousResults?.failed);
  const pendingTrend = calculateTrend(totalPending, previousResults?.pending);
  const durationTrend = calculateTrend(totalDuration, previousResults?.duration);
  
  // Add to history
  history.testResults.push(currentResults);
  
  // Keep only the last 10 entries
  if (history.testResults.length > 10) {
    history.testResults = history.testResults.slice(-10);
  }
  
  return {
    current: currentResults,
    trends: {
      passed: passedTrend,
      failed: failedTrend,
      pending: pendingTrend,
      duration: durationTrend
    },
    history: history.testResults
  };
}

// Process coverage data
function processCoverage() {
  console.log('Processing coverage data...');
  
  const serverCoverage = safeReadJson(config.serverCoverage);
  const clientCoverage = safeReadJson(config.clientCoverage);
  
  // If we don't have coverage data, try to run tests with coverage
  if (Object.keys(serverCoverage).length === 0 || Object.keys(clientCoverage).length === 0) {
    try {
      console.log('No coverage data found. Running tests with coverage...');
      
      // Run server tests with coverage
      execSync('cd ../server && npx jest --coverage', { stdio: 'inherit' });
      
      // Run client tests with coverage
      execSync('cd ../client && npx jest --coverage --watchAll=false', { stdio: 'inherit' });
      
      // Load the coverage data again
      const serverCoverage = safeReadJson(config.serverCoverage);
      const clientCoverage = safeReadJson(config.clientCoverage);
    } catch (error) {
      console.error('Error running tests with coverage:', error.message);
    }
  }
  
  // Extract coverage metrics
  const serverMetrics = {
    statements: serverCoverage.total?.statements?.pct || 0,
    branches: serverCoverage.total?.branches?.pct || 0,
    functions: serverCoverage.total?.functions?.pct || 0,
    lines: serverCoverage.total?.lines?.pct || 0
  };
  
  const clientMetrics = {
    statements: clientCoverage.total?.statements?.pct || 0,
    branches: clientCoverage.total?.branches?.pct || 0,
    functions: clientCoverage.total?.functions?.pct || 0,
    lines: clientCoverage.total?.lines?.pct || 0
  };
  
  // Calculate overall coverage
  const overall = {
    statements: (serverMetrics.statements + clientMetrics.statements) / 2,
    branches: (serverMetrics.branches + clientMetrics.branches) / 2,
    functions: (serverMetrics.functions + clientMetrics.functions) / 2,
    lines: (serverMetrics.lines + clientMetrics.lines) / 2
  };
  
  const overallAverage = (overall.statements + overall.branches + overall.functions + overall.lines) / 4;
  
  // Get previous results for trend calculation
  const previousCoverage = history.coverage.length > 0 ? history.coverage[history.coverage.length - 1] : null;
  
  const currentCoverage = {
    timestamp: new Date().toISOString(),
    overall: overallAverage,
    server: serverMetrics,
    client: clientMetrics
  };
  
  // Calculate trend
  const overallTrend = calculateTrend(overallAverage, previousCoverage?.overall);
  
  // Add to history
  history.coverage.push(currentCoverage);
  
  // Keep only the last 10 entries
  if (history.coverage.length > 10) {
    history.coverage = history.coverage.slice(-10);
  }
  
  return {
    current: currentCoverage,
    trend: overallTrend,
    history: history.coverage
  };
}

// Process security data
function processSecurity() {
  console.log('Processing security data...');
  
  const securityReport = safeReadJson(config.securityReport);
  
  // If we don't have security data, try to run security check
  if (Object.keys(securityReport).length === 0) {
    try {
      console.log('No security data found. Running security check...');
      
      // Create security-tests/reports directory if it doesn't exist
      if (!fs.existsSync(path.join(__dirname, '../security-tests/reports'))) {
        fs.mkdirSync(path.join(__dirname, '../security-tests/reports'), { recursive: true });
      }
      
      // Run dependency check
      execSync('node ../security-tests/dependency-check.js', { stdio: 'inherit' });
      
      // Load the security data again
      const securityReport = safeReadJson(config.securityReport);
    } catch (error) {
      console.error('Error running security check:', error.message);
    }
  }
  
  // Extract security metrics
  const metrics = {
    critical: securityReport.critical || 0,
    high: securityReport.high || 0,
    moderate: securityReport.moderate || 0,
    low: securityReport.low || 0,
    info: securityReport.info || 0
  };
  
  // Extract recent vulnerabilities
  const vulnerabilities = (securityReport.details || []).slice(0, 5).map(vuln => ({
    package: vuln.package,
    severity: vuln.severity,
    via: Array.isArray(vuln.via) ? vuln.via[0] : vuln.via,
    fixAvailable: vuln.fixAvailable
  }));
  
  // Get previous results for trend calculation
  const previousSecurity = history.security.length > 0 ? history.security[history.security.length - 1] : null;
  
  const currentSecurity = {
    timestamp: new Date().toISOString(),
    metrics: metrics,
    vulnerabilities: vulnerabilities
  };
  
  // Calculate trends
  const criticalTrend = calculateTrend(metrics.critical, previousSecurity?.metrics.critical);
  const highTrend = calculateTrend(metrics.high, previousSecurity?.metrics.high);
  const moderateTrend = calculateTrend(metrics.moderate, previousSecurity?.metrics.moderate);
  const lowTrend = calculateTrend(metrics.low, previousSecurity?.metrics.low);
  
  // Add to history
  history.security.push(currentSecurity);
  
  // Keep only the last 10 entries
  if (history.security.length > 10) {
    history.security = history.security.slice(-10);
  }
  
  return {
    current: currentSecurity,
    trends: {
      critical: criticalTrend,
      high: highTrend,
      moderate: moderateTrend,
      low: lowTrend
    },
    history: history.security
  };
}

// Process accessibility data
function processA11y() {
  console.log('Processing accessibility data...');
  
  const a11yReport = safeReadJson(config.a11yReport);
  
  // Extract accessibility metrics
  const metrics = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0
  };
  
  const issues = [];
  
  // Process a11y report if it exists
  if (a11yReport.violations) {
    a11yReport.violations.forEach(violation => {
      // Map axe impact to our categories
      const impact = violation.impact;
      if (impact === 'critical') metrics.critical++;
      else if (impact === 'serious') metrics.serious++;
      else if (impact === 'moderate') metrics.moderate++;
      else if (impact === 'minor') metrics.minor++;
      
      // Add to issues list
      issues.push({
        impact: impact,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        nodes: violation.nodes.length,
        element: violation.nodes[0]?.html || 'Unknown element'
      });
    });
  }
  
  // Get previous results for trend calculation
  const previousA11y = history.a11y.length > 0 ? history.a11y[history.a11y.length - 1] : null;
  
  const currentA11y = {
    timestamp: new Date().toISOString(),
    metrics: metrics,
    issues: issues.slice(0, 5) // Keep only the first 5 issues
  };
  
  // Calculate trends
  const criticalTrend = calculateTrend(metrics.critical, previousA11y?.metrics.critical);
  const seriousTrend = calculateTrend(metrics.serious, previousA11y?.metrics.serious);
  const moderateTrend = calculateTrend(metrics.moderate, previousA11y?.metrics.moderate);
  const minorTrend = calculateTrend(metrics.minor, previousA11y?.metrics.minor);
  
  // Add to history
  history.a11y.push(currentA11y);
  
  // Keep only the last 10 entries
  if (history.a11y.length > 10) {
    history.a11y = history.a11y.slice(-10);
  }
  
  return {
    current: currentA11y,
    trends: {
      critical: criticalTrend,
      serious: seriousTrend,
      moderate: moderateTrend,
      minor: minorTrend
    },
    history: history.a11y
  };
}

// Process performance data
function processPerformance() {
  console.log('Processing performance data...');
  
  const performanceReport = safeReadJson(config.performanceReport);
  
  // Extract performance metrics
  const metrics = {
    avgResponseTime: 0,
    p95ResponseTime: 0,
    maxResponseTime: 0,
    requestsPerSecond: 0,
    errorRate: 0
  };
  
  const thresholds = [];
  
  // Process performance report if it exists
  if (performanceReport.metrics) {
    const httpReqDuration = performanceReport.metrics.http_req_duration;
    if (httpReqDuration) {
      metrics.avgResponseTime = httpReqDuration.values.avg;
      metrics.p95ResponseTime = httpReqDuration.values['p(95)'];
      metrics.maxResponseTime = httpReqDuration.values.max;
    }
    
    const httpReqs = performanceReport.metrics.http_reqs;
    if (httpReqs) {
      metrics.requestsPerSecond = httpReqs.values.rate;
    }
    
    const httpReqFailed = performanceReport.metrics.http_req_failed;
    if (httpReqFailed) {
      metrics.errorRate = httpReqFailed.values.rate * 100; // Convert to percentage
    }
    
    // Extract thresholds
    Object.entries(performanceReport.metrics).forEach(([name, metric]) => {
      if (metric.thresholds) {
        Object.entries(metric.thresholds).forEach(([threshold, result]) => {
          thresholds.push({
            name: name,
            threshold: threshold,
            passed: result.ok
          });
        });
      }
    });
  }
  
  // Get previous results for trend calculation
  const previousPerformance = history.performance.length > 0 ? history.performance[history.performance.length - 1] : null;
  
  const currentPerformance = {
    timestamp: new Date().toISOString(),
    metrics: metrics,
    thresholds: thresholds
  };
  
  // Calculate trends
  const avgResponseTimeTrend = calculateTrend(metrics.avgResponseTime, previousPerformance?.metrics.avgResponseTime);
  const p95ResponseTimeTrend = calculateTrend(metrics.p95ResponseTime, previousPerformance?.metrics.p95ResponseTime);
  
  // Add to history
  history.performance.push(currentPerformance);
  
  // Keep only the last 10 entries
  if (history.performance.length > 10) {
    history.performance = history.performance.slice(-10);
  }
  
  return {
    current: currentPerformance,
    trends: {
      avgResponseTime: avgResponseTimeTrend,
      p95ResponseTime: p95ResponseTimeTrend
    },
    history: history.performance
  };
}

// Process visual regression data
function processVisual() {
  console.log('Processing visual regression data...');
  
  const visualReport = safeReadJson(config.visualReport);
  
  // Extract visual metrics
  const metrics = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  const changes = [];
  
  // Process visual report if it exists
  if (visualReport.tests) {
    visualReport.tests.forEach(test => {
      metrics.total++;
      if (test.status === 'passed') {
        metrics.passed++;
      } else {
        metrics.failed++;
        
        // Add to changes list
        changes.push({
          name: test.name,
          diffPercentage: test.diffPercentage || 0,
          beforeUrl: test.beforeUrl || '',
          afterUrl: test.afterUrl || ''
        });
      }
    });
  }
  
  // Get previous results for trend calculation
  const previousVisual = history.visual.length > 0 ? history.visual[history.visual.length - 1] : null;
  
  const currentVisual = {
    timestamp: new Date().toISOString(),
    metrics: metrics,
    changes: changes.slice(0, 3) // Keep only the first 3 changes
  };
  
  // Calculate trends
  const passedTrend = calculateTrend(metrics.passed, previousVisual?.metrics.passed);
  const failedTrend = calculateTrend(metrics.failed, previousVisual?.metrics.failed);
  
  // Add to history
  history.visual.push(currentVisual);
  
  // Keep only the last 10 entries
  if (history.visual.length > 10) {
    history.visual = history.visual.slice(-10);
  }
  
  return {
    current: currentVisual,
    trends: {
      passed: passedTrend,
      failed: failedTrend
    },
    history: history.visual
  };
}

// Main function
function main() {
  console.log('Updating dashboard...');
  
  // Process all data
  const testResults = processTestResults();
  const coverage = processCoverage();
  const security = processSecurity();
  const a11y = processA11y();
  const performance = processPerformance();
  const visual = processVisual();
  
  // Save history
  fs.writeFileSync(config.historyFile, JSON.stringify(history, null, 2));
  
  // Create dashboard data
  const dashboardData = {
    lastUpdated: new Date().toISOString(),
    testResults,
    coverage,
    security,
    a11y,
    performance,
    visual
  };
  
  // Generate JavaScript file
  const jsContent = `// Auto-generated dashboard data
const dashboardData = ${JSON.stringify(dashboardData, null, 2)};`;
  
  fs.writeFileSync(config.outputFile, jsContent);
  
  console.log('Dashboard updated successfully!');
}

// Run the main function
main();
