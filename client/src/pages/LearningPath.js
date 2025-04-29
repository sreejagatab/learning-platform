import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  Button,
  TextField,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import {
  BookmarkAdd as BookmarkIcon,
  ArrowBack as BackIcon,
  Share as ShareIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'react-toastify';

import LearningContext from '../context/LearningContext';

const LearningPath = () => {
  const { pathId } = useParams();
  const navigate = useNavigate();
  const {
    generateLearningPath,
    getContentById,
    saveContent,
    pathLoading,
  } = useContext(LearningContext);

  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('intermediate');
  const [loading, setLoading] = useState(false);
  const [pathData, setPathData] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState([]);

  // Load existing path if pathId is provided
  useEffect(() => {
    const loadPath = async () => {
      if (pathId) {
        setLoading(true);
        try {
          const data = await getContentById(pathId);
          if (data) {
            setPathData({
              content: data.content,
              title: data.title,
              level: data.metadata?.level || 'intermediate',
              topic: data.metadata?.topic || '',
              citations: data.metadata?.citations || [],
            });
            
            // Parse content to extract steps
            parsePathContent(data.content);
          }
        } catch (error) {
          console.error('Error loading learning path:', error);
          toast.error('Failed to load learning path');
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadPath();
  }, [pathId, getContentById]);

  // Parse path content to extract steps
  const parsePathContent = (content) => {
    try {
      // Simple parsing logic - extract sections based on headers
      const lines = content.split('\n');
      const extractedSteps = [];
      let currentStep = null;
      
      lines.forEach(line => {
        if (line.startsWith('## ')) {
          // New section (step) found
          if (currentStep) {
            extractedSteps.push(currentStep);
          }
          currentStep = {
            label: line.replace('## ', '').trim(),
            description: '',
          };
        } else if (currentStep) {
          currentStep.description += line + '\n';
        }
      });
      
      // Add the last step
      if (currentStep) {
        extractedSteps.push(currentStep);
      }
      
      setSteps(extractedSteps.length > 0 ? extractedSteps : [
        { label: 'Overview', description: content }
      ]);
    } catch (error) {
      console.error('Error parsing path content:', error);
      setSteps([{ label: 'Overview', description: content }]);
    }
  };

  // Handle form submission to create a new learning path
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    
    setLoading(true);
    try {
      const newPath = await generateLearningPath(topic);
      if (newPath) {
        setPathData({
          content: newPath.content,
          title: `Learning Path: ${topic}`,
          level,
          topic,
          citations: newPath.citations || [],
        });
        
        // Parse content to extract steps
        parsePathContent(newPath.content);
        
        // Update URL to include the new path ID
        if (newPath.pathId) {
          navigate(`/learning-path/${newPath.pathId}`, { replace: true });
        }
      }
    } catch (error) {
      console.error('Error generating learning path:', error);
      toast.error('Failed to generate learning path');
    } finally {
      setLoading(false);
    }
  };

  // Handle step navigation
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  // Save path to user's collection
  const handleSavePath = async () => {
    if (!pathData) return;
    
    try {
      await saveContent(
        pathData.title,
        pathData.content,
        'learning_path',
        {
          topic: pathData.topic,
          level: pathData.level,
          citations: pathData.citations,
        }
      );
      
      toast.success('Learning path saved to your collection');
    } catch (error) {
      console.error('Error saving learning path:', error);
      toast.error('Failed to save learning path');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {!pathId && !pathData ? (
        // Form to create a new learning path
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create Learning Path
          </Typography>
          <Typography variant="body1" paragraph>
            Generate a structured learning path for any topic based on your knowledge level
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
            <TextField
              fullWidth
              label="Topic"
              variant="outlined"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g., Machine Learning, World History, Quantum Physics)"
              required
              sx={{ mb: 3 }}
            />
            
            <TextField
              select
              fullWidth
              label="Your Knowledge Level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              SelectProps={{
                native: true,
              }}
              sx={{ mb: 3 }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </TextField>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading || pathLoading}
              sx={{ py: 1.5 }}
            >
              {loading || pathLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Generate Learning Path'
              )}
            </Button>
          </Box>
        </Paper>
      ) : loading ? (
        // Loading state
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : pathData ? (
        // Display learning path
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              startIcon={<BackIcon />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            
            <Box>
              <IconButton onClick={handleSavePath} title="Save Path">
                <BookmarkIcon />
              </IconButton>
              <IconButton title="Share Path">
                <ShareIcon />
              </IconButton>
              <IconButton title="Edit Path">
                <EditIcon />
              </IconButton>
            </Box>
          </Box>
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {pathData.title}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label={pathData.level.charAt(0).toUpperCase() + pathData.level.slice(1)} 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={`${steps.length} sections`} 
                color="secondary" 
                variant="outlined" 
              />
            </Box>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              This learning path is designed to guide you through {pathData.topic} in a structured way.
              Follow the steps in order for the best learning experience.
            </Alert>
          </Paper>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, position: 'sticky', top: 20 }}>
                <Typography variant="h6" gutterBottom>
                  Path Overview
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                  {steps.map((step, index) => (
                    <Box 
                      key={index}
                      sx={{ 
                        p: 1, 
                        mb: 1, 
                        borderRadius: 1,
                        bgcolor: activeStep === index ? 'primary.light' : 'transparent',
                        cursor: 'pointer',
                      }}
                      onClick={() => setActiveStep(index)}
                    >
                      <Typography 
                        variant="subtitle1"
                        sx={{ 
                          fontWeight: activeStep === index ? 'bold' : 'normal',
                          color: activeStep === index ? 'white' : 'inherit',
                        }}
                      >
                        {index + 1}. {step.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Stepper activeStep={activeStep} orientation="vertical">
                  {steps.map((step, index) => (
                    <Step key={index}>
                      <StepLabel>
                        <Typography variant="h6">{step.label}</Typography>
                      </StepLabel>
                      <StepContent>
                        <Box sx={{ mb: 2 }}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                  <SyntaxHighlighter
                                    style={atomDark}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {step.description}
                          </ReactMarkdown>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <div>
                            <Button
                              variant="contained"
                              onClick={handleNext}
                              sx={{ mt: 1, mr: 1 }}
                            >
                              {index === steps.length - 1 ? 'Finish' : 'Continue'}
                            </Button>
                            <Button
                              disabled={index === 0}
                              onClick={handleBack}
                              sx={{ mt: 1, mr: 1 }}
                            >
                              Back
                            </Button>
                          </div>
                        </Box>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
                
                {activeStep === steps.length && (
                  <Paper square elevation={0} sx={{ p: 3 }}>
                    <Typography>All steps completed - you've finished the learning path!</Typography>
                    <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                      Start Over
                    </Button>
                  </Paper>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Typography>No learning path found</Typography>
      )}
    </Container>
  );
};

export default LearningPath;
