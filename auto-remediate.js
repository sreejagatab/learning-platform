/**
 * Auto-Remediation Script
 * 
 * This script automatically fixes common issues found in tests.
 * It analyzes test results, security reports, and accessibility issues,
 * and applies fixes where possible.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  // Paths to test results and reports
  serverTestResults: path.join(__dirname, 'test-reports/server-test-results.json'),
  clientTestResults: path.join(__dirname, 'test-reports/client-test-results.json'),
  securityReport: path.join(__dirname, 'security-tests/reports/combined-audit-summary.json'),
  a11yReport: path.join(__dirname, 'e2e/cypress/a11y-results.json'),
  
  // Output files
  remediationLog: path.join(__dirname, 'remediation-log.md'),
  remediationScript: path.join(__dirname, 'apply-fixes.sh')
};

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

// Function to log remediation actions
function logRemediation(category, issue, action, status) {
  const timestamp = new Date().toISOString();
  const logEntry = `\n## ${timestamp} - ${category}\n\n**Issue:** ${issue}\n\n**Action:** ${action}\n\n**Status:** ${status}\n\n---\n`;
  
  if (!fs.existsSync(config.remediationLog)) {
    fs.writeFileSync(config.remediationLog, '# Automated Remediation Log\n');
  }
  
  fs.appendFileSync(config.remediationLog, logEntry);
}

// Function to add a command to the remediation script
function addRemediationCommand(command) {
  if (!fs.existsSync(config.remediationScript)) {
    // Create script with shebang
    fs.writeFileSync(config.remediationScript, '#!/bin/bash\n\n# Auto-generated remediation script\n\nset -e\n\n');
    // Make it executable
    try {
      fs.chmodSync(config.remediationScript, '755');
    } catch (error) {
      console.error('Error making script executable:', error.message);
    }
  }
  
  fs.appendFileSync(config.remediationScript, command + '\n');
}

// Function to fix security vulnerabilities
function fixSecurityVulnerabilities() {
  console.log('Checking for security vulnerabilities to fix...');
  
  const securityReport = safeReadJson(config.securityReport);
  
  if (Object.keys(securityReport).length === 0) {
    console.log('No security report found. Skipping security fixes.');
    return;
  }
  
  // Get vulnerabilities
  const vulnerabilities = securityReport.details || [];
  
  // Group vulnerabilities by package
  const packageVulnerabilities = {};
  
  vulnerabilities.forEach(vuln => {
    if (!packageVulnerabilities[vuln.package]) {
      packageVulnerabilities[vuln.package] = [];
    }
    packageVulnerabilities[vuln.package].push(vuln);
  });
  
  // Fix vulnerabilities
  Object.entries(packageVulnerabilities).forEach(([pkg, vulns]) => {
    // Check if fix is available
    const fixAvailable = vulns.some(vuln => vuln.fixAvailable);
    
    if (fixAvailable) {
      // Determine which component (server or client) the package belongs to
      let component = 'unknown';
      try {
        // Check if package is in server dependencies
        const serverPackageJson = safeReadJson(path.join(__dirname, 'server/package.json'));
        if (
          (serverPackageJson.dependencies && serverPackageJson.dependencies[pkg]) ||
          (serverPackageJson.devDependencies && serverPackageJson.devDependencies[pkg])
        ) {
          component = 'server';
        } else {
          // Check if package is in client dependencies
          const clientPackageJson = safeReadJson(path.join(__dirname, 'client/package.json'));
          if (
            (clientPackageJson.dependencies && clientPackageJson.dependencies[pkg]) ||
            (clientPackageJson.devDependencies && clientPackageJson.devDependencies[pkg])
          ) {
            component = 'client';
          }
        }
      } catch (error) {
        console.error('Error determining component for package:', error.message);
      }
      
      if (component !== 'unknown') {
        const severity = vulns[0].severity;
        const issue = `${pkg} has ${vulns.length} ${severity} severity vulnerabilities`;
        const action = `Update ${pkg} to the latest version in ${component}`;
        
        console.log(`Fixing ${issue}...`);
        
        // Add update command to remediation script
        const updateCommand = `echo "Updating ${pkg} in ${component}..."\ncd ${component} && npm update ${pkg} --save`;
        addRemediationCommand(updateCommand);
        
        logRemediation('Security', issue, action, 'Scheduled for fix');
      }
    }
  });
}

// Function to fix accessibility issues
function fixAccessibilityIssues() {
  console.log('Checking for accessibility issues to fix...');
  
  const a11yReport = safeReadJson(config.a11yReport);
  
  if (Object.keys(a11yReport).length === 0 || !a11yReport.violations) {
    console.log('No accessibility report found. Skipping accessibility fixes.');
    return;
  }
  
  // Get violations
  const violations = a11yReport.violations || [];
  
  // Process each violation
  violations.forEach(violation => {
    const impact = violation.impact;
    const description = violation.description;
    const helpUrl = violation.helpUrl;
    
    // Only auto-fix certain types of issues
    if (violation.id === 'image-alt' && violation.nodes && violation.nodes.length > 0) {
      // Fix missing alt text
      violation.nodes.forEach(node => {
        const html = node.html;
        const element = node.target[0];
        
        // Extract file path from element if possible
        const match = html.match(/src=["']([^"']+)["']/);
        if (match && match[1]) {
          const src = match[1];
          const altText = path.basename(src, path.extname(src)).replace(/[-_]/g, ' ');
          
          const issue = `Missing alt text for image: ${html}`;
          const action = `Add alt text "${altText}" to image`;
          
          console.log(`Fixing ${issue}...`);
          
          // Add fix to remediation script
          // This is a simplified approach - in a real scenario, you'd need to locate the file containing this HTML
          const fixCommand = `echo "Fixing missing alt text for ${element}..."\nfind client/src -type f -name "*.js" -o -name "*.jsx" -o -name "*.html" | xargs grep -l "${src}" | xargs sed -i 's|${src}"|${src}" alt="${altText}"|g'`;
          addRemediationCommand(fixCommand);
          
          logRemediation('Accessibility', issue, action, 'Scheduled for fix');
        }
      });
    } else if (violation.id === 'color-contrast' && violation.nodes && violation.nodes.length > 0) {
      // Log color contrast issues (these typically require manual intervention)
      violation.nodes.forEach(node => {
        const element = node.target[0];
        const html = node.html;
        
        const issue = `Insufficient color contrast for element: ${html}`;
        const action = `Review and update colors for better contrast. See ${helpUrl} for guidance.`;
        
        console.log(`Logging ${issue} for manual review...`);
        
        logRemediation('Accessibility', issue, action, 'Requires manual review');
      });
    } else if (violation.id === 'label' && violation.nodes && violation.nodes.length > 0) {
      // Fix missing form labels
      violation.nodes.forEach(node => {
        const html = node.html;
        const element = node.target[0];
        
        // Extract input name if possible
        const match = html.match(/name=["']([^"']+)["']/);
        if (match && match[1]) {
          const name = match[1];
          const labelText = name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          
          const issue = `Missing label for form element: ${html}`;
          const action = `Add label "${labelText}" to form element`;
          
          console.log(`Fixing ${issue}...`);
          
          // Add fix to remediation script
          const fixCommand = `echo "Fixing missing label for ${element}..."\nfind client/src -type f -name "*.js" -o -name "*.jsx" -o -name "*.html" | xargs grep -l "${html}" | xargs sed -i 's|${html}|<label for="${name}">${labelText}</label>\\n${html}|g'`;
          addRemediationCommand(fixCommand);
          
          logRemediation('Accessibility', issue, action, 'Scheduled for fix');
        }
      });
    }
  });
}

// Function to fix failing tests
function fixFailingTests() {
  console.log('Checking for failing tests to fix...');
  
  const serverTestResults = safeReadJson(config.serverTestResults);
  const clientTestResults = safeReadJson(config.clientTestResults);
  
  // Process server test failures
  if (serverTestResults.numFailedTests > 0) {
    console.log(`Found ${serverTestResults.numFailedTests} failing server tests.`);
    
    serverTestResults.testResults.forEach(testFile => {
      if (testFile.numFailingTests > 0) {
        testFile.assertionResults.forEach(test => {
          if (test.status === 'failed') {
            const testName = test.fullName || test.title;
            const testPath = testFile.name;
            
            // Extract error message
            const errorMessage = test.failureMessages[0] || 'Unknown error';
            
            // Check for common error patterns
            if (errorMessage.includes('timeout')) {
              // Fix timeout issues
              const issue = `Test timeout in ${testPath}: ${testName}`;
              const action = 'Increase test timeout';
              
              console.log(`Fixing ${issue}...`);
              
              // Add fix to remediation script
              const fixCommand = `echo "Fixing test timeout in ${testPath}..."\nsed -i 's/test(\\"${testName.replace(/"/g, '\\\\"')}\\"/test(\\"${testName.replace(/"/g, '\\\\"')}\\", { timeout: 10000 }/g' ${testPath}`;
              addRemediationCommand(fixCommand);
              
              logRemediation('Test', issue, action, 'Scheduled for fix');
            } else if (errorMessage.includes('expected') && errorMessage.includes('received')) {
              // Log assertion failures for manual review
              const issue = `Assertion failure in ${testPath}: ${testName}`;
              const action = 'Review test assertion';
              
              console.log(`Logging ${issue} for manual review...`);
              
              logRemediation('Test', issue, action, 'Requires manual review');
            }
          }
        });
      }
    });
  }
  
  // Process client test failures
  if (clientTestResults.numFailedTests > 0) {
    console.log(`Found ${clientTestResults.numFailedTests} failing client tests.`);
    
    clientTestResults.testResults.forEach(testFile => {
      if (testFile.numFailingTests > 0) {
        testFile.assertionResults.forEach(test => {
          if (test.status === 'failed') {
            const testName = test.fullName || test.title;
            const testPath = testFile.name;
            
            // Extract error message
            const errorMessage = test.failureMessages[0] || 'Unknown error';
            
            // Check for common error patterns
            if (errorMessage.includes('timeout')) {
              // Fix timeout issues
              const issue = `Test timeout in ${testPath}: ${testName}`;
              const action = 'Increase test timeout';
              
              console.log(`Fixing ${issue}...`);
              
              // Add fix to remediation script
              const fixCommand = `echo "Fixing test timeout in ${testPath}..."\nsed -i 's/test(\\"${testName.replace(/"/g, '\\\\"')}\\"/test(\\"${testName.replace(/"/g, '\\\\"')}\\", { timeout: 10000 }/g' ${testPath}`;
              addRemediationCommand(fixCommand);
              
              logRemediation('Test', issue, action, 'Scheduled for fix');
            } else if (errorMessage.includes('act(...)')) {
              // Fix React act() warnings
              const issue = `React act() warning in ${testPath}: ${testName}`;
              const action = 'Wrap state updates in act()';
              
              console.log(`Fixing ${issue}...`);
              
              // Add fix to remediation script
              const fixCommand = `echo "Fixing React act() warning in ${testPath}..."\nsed -i 's/fireEvent/act(() => { fireEvent/g; s/});/}); });/g' ${testPath}`;
              addRemediationCommand(fixCommand);
              
              logRemediation('Test', issue, action, 'Scheduled for fix');
            }
          }
        });
      }
    });
  }
}

// Main function
function main() {
  console.log('Starting auto-remediation...');
  
  // Create a new remediation script
  if (fs.existsSync(config.remediationScript)) {
    fs.unlinkSync(config.remediationScript);
  }
  
  // Fix security vulnerabilities
  fixSecurityVulnerabilities();
  
  // Fix accessibility issues
  fixAccessibilityIssues();
  
  // Fix failing tests
  fixFailingTests();
  
  // Add final message to remediation script
  addRemediationCommand('\necho "Remediation complete. Please review changes and run tests again."');
  
  console.log(`Auto-remediation complete. See ${config.remediationLog} for details.`);
  console.log(`To apply fixes, run: bash ${config.remediationScript}`);
}

// Run the main function
main();
