/**
 * Test Coverage Analysis Script
 * 
 * This script analyzes test coverage and suggests areas for improvement.
 * It identifies files with low coverage, untested functions, and missing test cases.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  // Paths to coverage reports
  serverCoverage: path.join(__dirname, 'server/coverage/coverage-summary.json'),
  clientCoverage: path.join(__dirname, 'client/coverage/coverage-summary.json'),
  
  // Thresholds
  lowCoverageThreshold: 70, // Files below this percentage are considered low coverage
  criticalCoverageThreshold: 50, // Files below this percentage are considered critical
  
  // Output files
  coverageReport: path.join(__dirname, 'coverage-analysis.md'),
  testSuggestions: path.join(__dirname, 'test-suggestions.md')
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

// Function to generate coverage report
function generateCoverageReport(serverCoverage, clientCoverage) {
  console.log('Generating coverage report...');
  
  // Initialize report
  let report = '# Test Coverage Analysis\n\n';
  report += `Generated on: ${new Date().toISOString()}\n\n`;
  
  // Add overall coverage
  report += '## Overall Coverage\n\n';
  
  const serverTotal = serverCoverage.total || {};
  const clientTotal = clientCoverage.total || {};
  
  report += '### Server\n\n';
  report += '| Metric | Coverage |\n';
  report += '|--------|----------|\n';
  report += `| Statements | ${serverTotal.statements?.pct || 0}% |\n`;
  report += `| Branches | ${serverTotal.branches?.pct || 0}% |\n`;
  report += `| Functions | ${serverTotal.functions?.pct || 0}% |\n`;
  report += `| Lines | ${serverTotal.lines?.pct || 0}% |\n\n`;
  
  report += '### Client\n\n';
  report += '| Metric | Coverage |\n';
  report += '|--------|----------|\n';
  report += `| Statements | ${clientTotal.statements?.pct || 0}% |\n`;
  report += `| Branches | ${clientTotal.branches?.pct || 0}% |\n`;
  report += `| Functions | ${clientTotal.functions?.pct || 0}% |\n`;
  report += `| Lines | ${clientTotal.lines?.pct || 0}% |\n\n`;
  
  // Add low coverage files
  report += '## Low Coverage Files\n\n';
  
  // Process server files
  report += '### Server\n\n';
  report += '| File | Statements | Branches | Functions | Lines |\n';
  report += '|------|------------|----------|-----------|-------|\n';
  
  let serverLowCoverageFiles = [];
  
  Object.entries(serverCoverage).forEach(([filePath, coverage]) => {
    // Skip total and files with high coverage
    if (filePath === 'total') return;
    
    const statements = coverage.statements?.pct || 0;
    const branches = coverage.branches?.pct || 0;
    const functions = coverage.functions?.pct || 0;
    const lines = coverage.lines?.pct || 0;
    
    // Calculate average coverage
    const avgCoverage = (statements + branches + functions + lines) / 4;
    
    if (avgCoverage < config.lowCoverageThreshold) {
      serverLowCoverageFiles.push({
        filePath,
        statements,
        branches,
        functions,
        lines,
        avgCoverage
      });
      
      report += `| ${filePath} | ${statements}% | ${branches}% | ${functions}% | ${lines}% |\n`;
    }
  });
  
  if (serverLowCoverageFiles.length === 0) {
    report += 'No server files with low coverage found.\n\n';
  } else {
    report += '\n';
  }
  
  // Process client files
  report += '### Client\n\n';
  report += '| File | Statements | Branches | Functions | Lines |\n';
  report += '|------|------------|----------|-----------|-------|\n';
  
  let clientLowCoverageFiles = [];
  
  Object.entries(clientCoverage).forEach(([filePath, coverage]) => {
    // Skip total and files with high coverage
    if (filePath === 'total') return;
    
    const statements = coverage.statements?.pct || 0;
    const branches = coverage.branches?.pct || 0;
    const functions = coverage.functions?.pct || 0;
    const lines = coverage.lines?.pct || 0;
    
    // Calculate average coverage
    const avgCoverage = (statements + branches + functions + lines) / 4;
    
    if (avgCoverage < config.lowCoverageThreshold) {
      clientLowCoverageFiles.push({
        filePath,
        statements,
        branches,
        functions,
        lines,
        avgCoverage
      });
      
      report += `| ${filePath} | ${statements}% | ${branches}% | ${functions}% | ${lines}% |\n`;
    }
  });
  
  if (clientLowCoverageFiles.length === 0) {
    report += 'No client files with low coverage found.\n\n';
  } else {
    report += '\n';
  }
  
  // Add critical files
  report += '## Critical Coverage Files\n\n';
  report += 'Files with coverage below 50% that should be prioritized for testing.\n\n';
  
  // Process server critical files
  report += '### Server\n\n';
  
  const serverCriticalFiles = serverLowCoverageFiles.filter(file => file.avgCoverage < config.criticalCoverageThreshold);
  
  if (serverCriticalFiles.length === 0) {
    report += 'No server files with critical coverage found.\n\n';
  } else {
    report += '| File | Average Coverage |\n';
    report += '|------|------------------|\n';
    
    serverCriticalFiles.forEach(file => {
      report += `| ${file.filePath} | ${file.avgCoverage.toFixed(2)}% |\n`;
    });
    
    report += '\n';
  }
  
  // Process client critical files
  report += '### Client\n\n';
  
  const clientCriticalFiles = clientLowCoverageFiles.filter(file => file.avgCoverage < config.criticalCoverageThreshold);
  
  if (clientCriticalFiles.length === 0) {
    report += 'No client files with critical coverage found.\n\n';
  } else {
    report += '| File | Average Coverage |\n';
    report += '|------|------------------|\n';
    
    clientCriticalFiles.forEach(file => {
      report += `| ${file.filePath} | ${file.avgCoverage.toFixed(2)}% |\n`;
    });
    
    report += '\n';
  }
  
  // Add recommendations
  report += '## Recommendations\n\n';
  
  // Server recommendations
  if (serverLowCoverageFiles.length > 0) {
    report += '### Server\n\n';
    report += '1. Focus on improving test coverage for these critical files:\n';
    
    serverCriticalFiles.slice(0, 5).forEach(file => {
      report += `   - ${file.filePath}\n`;
    });
    
    report += '\n2. Add more tests for functions and branches, which typically have lower coverage.\n\n';
  }
  
  // Client recommendations
  if (clientLowCoverageFiles.length > 0) {
    report += '### Client\n\n';
    report += '1. Focus on improving test coverage for these critical files:\n';
    
    clientCriticalFiles.slice(0, 5).forEach(file => {
      report += `   - ${file.filePath}\n`;
    });
    
    report += '\n2. Add more tests for complex UI components and state management.\n\n';
  }
  
  // Write report to file
  fs.writeFileSync(config.coverageReport, report);
  
  console.log(`Coverage report generated: ${config.coverageReport}`);
  
  return {
    serverLowCoverageFiles,
    clientLowCoverageFiles,
    serverCriticalFiles,
    clientCriticalFiles
  };
}

// Function to generate test suggestions
function generateTestSuggestions(serverCriticalFiles, clientCriticalFiles) {
  console.log('Generating test suggestions...');
  
  // Initialize suggestions
  let suggestions = '# Test Suggestions\n\n';
  suggestions += `Generated on: ${new Date().toISOString()}\n\n`;
  
  // Add server test suggestions
  suggestions += '## Server Test Suggestions\n\n';
  
  if (serverCriticalFiles.length === 0) {
    suggestions += 'No critical server files found that need immediate attention.\n\n';
  } else {
    serverCriticalFiles.forEach(file => {
      suggestions += `### ${file.filePath}\n\n`;
      
      // Analyze file to suggest tests
      try {
        const filePath = path.join(__dirname, file.filePath);
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          
          // Extract functions
          const functionMatches = fileContent.match(/function\s+(\w+)\s*\([^)]*\)/g) || [];
          const arrowFunctionMatches = fileContent.match(/const\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=]*)\s*=>/g) || [];
          
          if (functionMatches.length > 0 || arrowFunctionMatches.length > 0) {
            suggestions += '#### Functions to Test\n\n';
            
            functionMatches.forEach(match => {
              const functionName = match.match(/function\s+(\w+)/)[1];
              suggestions += `- \`${functionName}()\`: Test with various inputs and edge cases\n`;
            });
            
            arrowFunctionMatches.forEach(match => {
              const functionName = match.match(/const\s+(\w+)/)[1];
              suggestions += `- \`${functionName}()\`: Test with various inputs and edge cases\n`;
            });
            
            suggestions += '\n';
          }
          
          // Extract conditional statements
          const conditionalMatches = fileContent.match(/if\s*\([^)]+\)/g) || [];
          
          if (conditionalMatches.length > 0) {
            suggestions += '#### Conditional Branches to Test\n\n';
            
            conditionalMatches.slice(0, 5).forEach((match, index) => {
              suggestions += `- Condition ${index + 1}: \`${match.replace(/\s+/g, ' ')}\`\n`;
            });
            
            suggestions += '\n';
          }
          
          // Extract error handling
          const errorMatches = fileContent.match(/catch\s*\([^)]*\)/g) || [];
          
          if (errorMatches.length > 0) {
            suggestions += '#### Error Handling to Test\n\n';
            
            errorMatches.forEach((match, index) => {
              suggestions += `- Error case ${index + 1}: Test error handling in the catch block\n`;
            });
            
            suggestions += '\n';
          }
          
          // Suggest test structure
          suggestions += '#### Suggested Test Structure\n\n';
          suggestions += '```javascript\n';
          suggestions += `describe('${path.basename(file.filePath, path.extname(file.filePath))}', () => {\n`;
          
          if (functionMatches.length > 0 || arrowFunctionMatches.length > 0) {
            const functionName = functionMatches.length > 0 
              ? functionMatches[0].match(/function\s+(\w+)/)[1]
              : arrowFunctionMatches[0].match(/const\s+(\w+)/)[1];
            
            suggestions += `  describe('${functionName}', () => {\n`;
            suggestions += '    test(\'should handle valid input correctly\', () => {\n';
            suggestions += '      // Arrange\n';
            suggestions += '      const input = \'valid input\';\n';
            suggestions += '      \n';
            suggestions += '      // Act\n';
            suggestions += `      const result = ${functionName}(input);\n`;
            suggestions += '      \n';
            suggestions += '      // Assert\n';
            suggestions += '      expect(result).toBeDefined();\n';
            suggestions += '    });\n';
            suggestions += '    \n';
            suggestions += '    test(\'should handle edge cases\', () => {\n';
            suggestions += '      // Arrange\n';
            suggestions += '      const input = null;\n';
            suggestions += '      \n';
            suggestions += '      // Act & Assert\n';
            suggestions += `      expect(() => ${functionName}(input)).not.toThrow();\n`;
            suggestions += '    });\n';
            suggestions += '  });\n';
          }
          
          suggestions += '});\n';
          suggestions += '```\n\n';
        }
      } catch (error) {
        console.error(`Error analyzing file ${file.filePath}:`, error.message);
        suggestions += 'Error analyzing file. Please check the file manually.\n\n';
      }
    });
  }
  
  // Add client test suggestions
  suggestions += '## Client Test Suggestions\n\n';
  
  if (clientCriticalFiles.length === 0) {
    suggestions += 'No critical client files found that need immediate attention.\n\n';
  } else {
    clientCriticalFiles.forEach(file => {
      suggestions += `### ${file.filePath}\n\n`;
      
      // Analyze file to suggest tests
      try {
        const filePath = path.join(__dirname, file.filePath);
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          
          // Check if it's a React component
          const isReactComponent = fileContent.includes('import React') || 
                                  fileContent.includes('from \'react\'') ||
                                  fileContent.match(/class\s+\w+\s+extends\s+(?:React\.)?Component/);
          
          if (isReactComponent) {
            suggestions += '#### Component Testing\n\n';
            suggestions += '- Test component rendering\n';
            suggestions += '- Test component props\n';
            suggestions += '- Test component state changes\n';
            suggestions += '- Test component user interactions\n\n';
            
            // Suggest test structure for React component
            suggestions += '#### Suggested Test Structure\n\n';
            suggestions += '```javascript\n';
            suggestions += `import React from 'react';\n`;
            suggestions += `import { render, screen, fireEvent } from '@testing-library/react';\n`;
            suggestions += `import '@testing-library/jest-dom';\n`;
            suggestions += `import ${path.basename(file.filePath, path.extname(file.filePath))} from '${file.filePath.replace(/\\/g, '/').replace(/^client\/src\//, '../')}';\n\n`;
            suggestions += `describe('${path.basename(file.filePath, path.extname(file.filePath))}', () => {\n`;
            suggestions += '  test(\'renders correctly\', () => {\n';
            suggestions += '    // Arrange\n';
            suggestions += `    render(<${path.basename(file.filePath, path.extname(file.filePath))} />);\n`;
            suggestions += '    \n';
            suggestions += '    // Assert\n';
            suggestions += '    expect(screen.getByText(/some text/i)).toBeInTheDocument();\n';
            suggestions += '  });\n';
            suggestions += '  \n';
            suggestions += '  test(\'handles user interaction\', () => {\n';
            suggestions += '    // Arrange\n';
            suggestions += `    render(<${path.basename(file.filePath, path.extname(file.filePath))} />);\n`;
            suggestions += '    \n';
            suggestions += '    // Act\n';
            suggestions += '    fireEvent.click(screen.getByRole(\'button\'));\n';
            suggestions += '    \n';
            suggestions += '    // Assert\n';
            suggestions += '    expect(screen.getByText(/changed state/i)).toBeInTheDocument();\n';
            suggestions += '  });\n';
            suggestions += '});\n';
            suggestions += '```\n\n';
          } else {
            // Extract functions
            const functionMatches = fileContent.match(/function\s+(\w+)\s*\([^)]*\)/g) || [];
            const arrowFunctionMatches = fileContent.match(/const\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=]*)\s*=>/g) || [];
            
            if (functionMatches.length > 0 || arrowFunctionMatches.length > 0) {
              suggestions += '#### Functions to Test\n\n';
              
              functionMatches.forEach(match => {
                const functionName = match.match(/function\s+(\w+)/)[1];
                suggestions += `- \`${functionName}()\`: Test with various inputs and edge cases\n`;
              });
              
              arrowFunctionMatches.forEach(match => {
                const functionName = match.match(/const\s+(\w+)/)[1];
                suggestions += `- \`${functionName}()\`: Test with various inputs and edge cases\n`;
              });
              
              suggestions += '\n';
            }
            
            // Suggest test structure
            suggestions += '#### Suggested Test Structure\n\n';
            suggestions += '```javascript\n';
            suggestions += `import ${path.basename(file.filePath, path.extname(file.filePath))} from '${file.filePath.replace(/\\/g, '/').replace(/^client\/src\//, '../')}';\n\n`;
            suggestions += `describe('${path.basename(file.filePath, path.extname(file.filePath))}', () => {\n`;
            
            if (functionMatches.length > 0 || arrowFunctionMatches.length > 0) {
              const functionName = functionMatches.length > 0 
                ? functionMatches[0].match(/function\s+(\w+)/)[1]
                : arrowFunctionMatches[0].match(/const\s+(\w+)/)[1];
              
              suggestions += `  describe('${functionName}', () => {\n`;
              suggestions += '    test(\'should work correctly\', () => {\n';
              suggestions += '      // Arrange\n';
              suggestions += '      const input = \'test input\';\n';
              suggestions += '      \n';
              suggestions += '      // Act\n';
              suggestions += `      const result = ${functionName}(input);\n`;
              suggestions += '      \n';
              suggestions += '      // Assert\n';
              suggestions += '      expect(result).toBeDefined();\n';
              suggestions += '    });\n';
              suggestions += '  });\n';
            }
            
            suggestions += '});\n';
            suggestions += '```\n\n';
          }
        }
      } catch (error) {
        console.error(`Error analyzing file ${file.filePath}:`, error.message);
        suggestions += 'Error analyzing file. Please check the file manually.\n\n';
      }
    });
  }
  
  // Add general test improvement suggestions
  suggestions += '## General Test Improvement Suggestions\n\n';
  suggestions += '1. **Use Test-Driven Development (TDD)** for new features\n';
  suggestions += '2. **Add integration tests** to test interactions between components\n';
  suggestions += '3. **Test error handling** in all API calls and async operations\n';
  suggestions += '4. **Add snapshot tests** for UI components\n';
  suggestions += '5. **Test edge cases** such as empty arrays, null values, and boundary conditions\n';
  suggestions += '6. **Use mocks and stubs** to isolate units of code\n';
  suggestions += '7. **Add performance tests** for critical paths\n';
  suggestions += '8. **Test accessibility** of UI components\n';
  
  // Write suggestions to file
  fs.writeFileSync(config.testSuggestions, suggestions);
  
  console.log(`Test suggestions generated: ${config.testSuggestions}`);
}

// Main function
function main() {
  console.log('Starting coverage analysis...');
  
  // Check if coverage reports exist
  const serverCoverage = safeReadJson(config.serverCoverage);
  const clientCoverage = safeReadJson(config.clientCoverage);
  
  // If coverage reports don't exist, run tests with coverage
  if (Object.keys(serverCoverage).length === 0 || Object.keys(clientCoverage).length === 0) {
    console.log('Coverage reports not found. Running tests with coverage...');
    
    try {
      // Run server tests with coverage
      console.log('Running server tests with coverage...');
      execSync('cd server && npm test -- --coverage', { stdio: 'inherit' });
      
      // Run client tests with coverage
      console.log('Running client tests with coverage...');
      execSync('cd client && npm test -- --coverage --watchAll=false', { stdio: 'inherit' });
      
      // Load coverage reports again
      const serverCoverage = safeReadJson(config.serverCoverage);
      const clientCoverage = safeReadJson(config.clientCoverage);
      
      // Generate reports
      const { serverCriticalFiles, clientCriticalFiles } = generateCoverageReport(serverCoverage, clientCoverage);
      generateTestSuggestions(serverCriticalFiles, clientCriticalFiles);
    } catch (error) {
      console.error('Error running tests with coverage:', error.message);
    }
  } else {
    // Generate reports
    const { serverCriticalFiles, clientCriticalFiles } = generateCoverageReport(serverCoverage, clientCoverage);
    generateTestSuggestions(serverCriticalFiles, clientCriticalFiles);
  }
  
  console.log('Coverage analysis complete.');
}

// Run the main function
main();
