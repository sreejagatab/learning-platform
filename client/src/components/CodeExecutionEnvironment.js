import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PlayArrow as RunIcon,
  ContentCopy as CopyIcon,
  Code as CodeIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * Code execution environment component
 * @param {Object} props - Component props
 * @param {Function} props.onInsert - Callback when code is inserted
 */
const CodeExecutionEnvironment = ({ onInsert }) => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  // Available languages
  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'swift', label: 'Swift' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
  ];

  // Language-specific code templates
  const codeTemplates = {
    javascript: 'console.log("Hello, world!");',
    python: 'print("Hello, world!")',
    html: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Hello</title>\n</head>\n<body>\n  <h1>Hello, world!</h1>\n</body>\n</html>',
    css: 'body {\n  font-family: Arial, sans-serif;\n  color: #333;\n  background-color: #f5f5f5;\n}',
    java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, world!");\n  }\n}',
    csharp: 'using System;\n\nclass Program {\n  static void Main() {\n    Console.WriteLine("Hello, world!");\n  }\n}',
    cpp: '#include <iostream>\n\nint main() {\n  std::cout << "Hello, world!" << std::endl;\n  return 0;\n}',
    php: '<?php\n  echo "Hello, world!";\n?>',
    ruby: 'puts "Hello, world!"',
    swift: 'print("Hello, world!")',
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n  fmt.Println("Hello, world!")\n}',
    rust: 'fn main() {\n  println!("Hello, world!");\n}',
  };

  useEffect(() => {
    // Set default code template when language changes
    if (codeTemplates[language] && (!code || code === codeTemplates[Object.keys(codeTemplates).find(key => key !== language)])) {
      setCode(codeTemplates[language]);
    }
  }, [language, code]);

  const handleOpen = () => {
    setOpen(true);
    setCode(codeTemplates[language] || '');
    setOutput('');
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInsert = () => {
    if (!code.trim()) {
      return;
    }

    // Create HTML for code block with syntax highlighting
    const codeHtml = `<pre class="language-${language}"><code>${code}</code></pre>`;
    
    // If there's output, include it
    const outputHtml = output ? 
      `<div class="code-output"><pre>${output}</pre></div>` : '';
    
    // Combine code and output
    const fullHtml = `<div class="code-block">${codeHtml}${outputHtml}</div>`;
    
    onInsert(fullHtml);
    handleClose();
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      return;
    }

    setIsRunning(true);
    setError(null);
    setOutput('');

    try {
      // For JavaScript, we can execute it directly in the browser
      if (language === 'javascript') {
        try {
          // Create a sandbox function to execute the code
          const sandbox = new Function(`
            try {
              // Capture console.log output
              const logs = [];
              const originalConsoleLog = console.log;
              console.log = (...args) => {
                logs.push(args.map(arg => 
                  typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' '));
                originalConsoleLog(...args);
              };
              
              // Execute the code
              ${code}
              
              // Return the logs
              return logs.join('\\n');
            } catch (error) {
              return 'Error: ' + error.message;
            } finally {
              // Restore original console.log
              console.log = originalConsoleLog;
            }
          `);
          
          const result = sandbox();
          setOutput(result);
        } catch (error) {
          setOutput(`Error: ${error.message}`);
        }
      } else {
        // For other languages, we would typically call a backend API
        // Since we don't have a backend for code execution, we'll simulate it
        setTimeout(() => {
          setOutput(`[Simulated output for ${language}]\nCode execution is simulated for non-JavaScript languages.\nIn a production environment, this would call a backend service.`);
        }, 1000);
      }
    } catch (error) {
      setError(`Failed to execute code: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <>
      <Tooltip title="Insert Code Block">
        <Button 
          variant="outlined" 
          startIcon={<CodeIcon />} 
          onClick={handleOpen}
          size="small"
        >
          Code
        </Button>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Code Editor
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="language-select-label">Language</InputLabel>
              <Select
                labelId="language-select-label"
                value={language}
                label="Language"
                onChange={(e) => setLanguage(e.target.value)}
              >
                {languages.map((lang) => (
                  <MenuItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                fullWidth
                multiline
                rows={10}
                variant="outlined"
                sx={{ 
                  fontFamily: 'monospace',
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                  }
                }}
              />
              <Tooltip title="Copy Code">
                <IconButton
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  onClick={handleCopyCode}
                >
                  <CopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RunIcon />}
              onClick={handleRunCode}
              disabled={isRunning || !code.trim()}
            >
              {isRunning ? <CircularProgress size={24} /> : 'Run Code'}
            </Button>
            
            <Typography variant="caption" color="text.secondary">
              {language === 'javascript' ? 'Code runs in your browser' : 'Code execution is simulated'}
            </Typography>
          </Box>

          {error && (
            <Box sx={{ mb: 2 }}>
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            </Box>
          )}

          {(output || isRunning) && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Output:
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: '#f5f5f5',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  overflowX: 'auto',
                  minHeight: 100,
                }}
              >
                {isRunning ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  output
                )}
              </Paper>
            </>
          )}

          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Preview:
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2 }}>
            <SyntaxHighlighter language={language} style={atomDark}>
              {code}
            </SyntaxHighlighter>
          </Paper>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleInsert} 
            variant="contained" 
            color="primary"
            disabled={!code.trim()}
          >
            Insert
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CodeExecutionEnvironment;
