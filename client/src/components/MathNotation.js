import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton, Tooltip, Box, Typography, Tab, Tabs } from '@mui/material';
import { Functions as MathIcon, Close as CloseIcon } from '@mui/icons-material';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * Math notation component for inserting LaTeX equations
 * @param {Object} props - Component props
 * @param {Function} props.onInsert - Callback when equation is inserted
 */
const MathNotation = ({ onInsert }) => {
  const [open, setOpen] = useState(false);
  const [equation, setEquation] = useState('');
  const [displayMode, setDisplayMode] = useState(0); // 0 for inline, 1 for block
  const [previewError, setPreviewError] = useState(null);

  const handleOpen = () => {
    setOpen(true);
    setEquation('');
    setPreviewError(null);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInsert = () => {
    if (!equation.trim()) {
      return;
    }

    try {
      // Validate equation by rendering it
      if (displayMode === 0) {
        // Inline mode
        onInsert(`\\(${equation}\\)`);
      } else {
        // Block mode
        onInsert(`\\[${equation}\\]`);
      }
      handleClose();
    } catch (error) {
      setPreviewError('Invalid LaTeX syntax');
    }
  };

  const handleTabChange = (event, newValue) => {
    setDisplayMode(newValue);
  };

  const renderPreview = () => {
    if (!equation.trim()) {
      return (
        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          Enter a LaTeX equation to see the preview
        </Box>
      );
    }

    try {
      return (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 80 }}>
          {displayMode === 0 ? (
            <InlineMath math={equation} />
          ) : (
            <BlockMath math={equation} />
          )}
        </Box>
      );
    } catch (error) {
      return (
        <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
          Invalid LaTeX syntax
        </Box>
      );
    }
  };

  // Example equations for quick insertion
  const examples = [
    { label: 'Quadratic Formula', equation: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}' },
    { label: 'Pythagorean Theorem', equation: 'a^2 + b^2 = c^2' },
    { label: 'Euler\'s Identity', equation: 'e^{i\\pi} + 1 = 0' },
    { label: 'Integral', equation: '\\int_{a}^{b} f(x) \\, dx' },
    { label: 'Sum', equation: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}' },
    { label: 'Limit', equation: '\\lim_{x \\to \\infty} \\frac{1}{x} = 0' },
    { label: 'Matrix', equation: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' }
  ];

  return (
    <>
      <Tooltip title="Insert Math Equation">
        <Button 
          variant="outlined" 
          startIcon={<MathIcon />} 
          onClick={handleOpen}
          size="small"
        >
          Math
        </Button>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Insert Math Equation
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
          <Tabs value={displayMode} onChange={handleTabChange} centered sx={{ mb: 2 }}>
            <Tab label="Inline Math" />
            <Tab label="Block Math" />
          </Tabs>

          <TextField
            label="LaTeX Equation"
            value={equation}
            onChange={(e) => {
              setEquation(e.target.value);
              setPreviewError(null);
            }}
            fullWidth
            multiline
            rows={3}
            placeholder="Enter LaTeX equation (e.g., x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a})"
            error={!!previewError}
            helperText={previewError}
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle1" gutterBottom>
            Preview:
          </Typography>
          
          <Box 
            sx={{ 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 1, 
              mb: 2,
              minHeight: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.paper'
            }}
          >
            {renderPreview()}
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            Quick Examples:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {examples.map((ex, index) => (
              <Button 
                key={index} 
                size="small" 
                variant="outlined"
                onClick={() => setEquation(ex.equation)}
              >
                {ex.label}
              </Button>
            ))}
          </Box>

          <Typography variant="caption" color="text.secondary">
            Use LaTeX syntax for mathematical equations. For more information, visit the <a href="https://katex.org/docs/supported.html" target="_blank" rel="noopener noreferrer">KaTeX documentation</a>.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleInsert} 
            variant="contained" 
            color="primary"
            disabled={!equation.trim()}
          >
            Insert
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MathNotation;
