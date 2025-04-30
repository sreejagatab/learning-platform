@echo off

REM Run the coverage analysis script
echo Running coverage analysis...
node analyze-coverage.js

REM Open the coverage report
start coverage-analysis.md
