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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Tab,
  Tabs,
} from '@mui/material';
import {
  BookmarkAdd as BookmarkIcon,
  ArrowBack as BackIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  QuestionAnswer as QuizIcon,
  MenuBook as ResourceIcon,
  MoreVert as MoreIcon,
  Flag as FlagIcon,
  Timeline as TimelineIcon,
  Lightbulb as LightbulbIcon,
  PlayArrow as PlayArrowIcon,
  Article as ArticleIcon,
  Build as BuildIcon,
  AccountTree as AccountTreeIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'react-toastify';

import LearningContext from '../context/LearningContext';
import LearningPathContext from '../context/LearningPathContext';
import PrerequisitesList from '../components/learning/PrerequisitesList';
import BranchingPathsSelector from '../components/learning/BranchingPathsSelector';

const LearningPath = () => {
  const { pathId } = useParams();
  const navigate = useNavigate();

  // Original learning context for backward compatibility
  const {
    generateLearningPath: generateBasicLearningPath,
    getContentById,
    saveContent,
    pathLoading: basicPathLoading,
  } = useContext(LearningContext);

  // Advanced learning path context
  const {
    createLearningPath,
    getLearningPathById,
    completeStep,
    takeCheckpoint,
    pathLoading,
    currentPath,
  } = useContext(LearningPathContext);

  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('intermediate');
  const [loading, setLoading] = useState(false);
  const [pathData, setPathData] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState([]);

  // State for checkpoints
  const [checkpointOpen, setCheckpointOpen] = useState(false);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(null);
  const [checkpointAnswers, setCheckpointAnswers] = useState([]);

  // State for resources
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [currentResources, setCurrentResources] = useState([]);

  // State for prerequisites
  const [prerequisites, setPrerequisites] = useState([]);
  const [showPrerequisites, setShowPrerequisites] = useState(false);

  // State for branches
  const [branches, setBranches] = useState([]);
  const [activeBranch, setActiveBranch] = useState(null);
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchDescription, setNewBranchDescription] = useState('');

  // State for tabs
  const [activeTab, setActiveTab] = useState(0);

  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  // Load existing path if pathId is provided
  useEffect(() => {
    const loadPath = async () => {
      if (pathId) {
        setLoading(true);
        try {
          // First try to load as an advanced learning path
          const advancedPath = await getLearningPathById(pathId);

          if (advancedPath) {
            // It's an advanced learning path
            setPathData(advancedPath);

            // Set steps from the path data
            if (advancedPath.steps && advancedPath.steps.length > 0) {
              setSteps(advancedPath.steps.map(step => ({
                ...step,
                label: step.title,
                description: step.content
              })));
            } else if (advancedPath.rawContent) {
              // Fallback to parsing raw content
              parsePathContent(advancedPath.rawContent);
            }

            // Set prerequisites
            if (advancedPath.prerequisites && advancedPath.prerequisites.length > 0) {
              setPrerequisites(advancedPath.prerequisites);
              // Show prerequisites automatically if there are required ones
              const hasRequiredPrereqs = advancedPath.prerequisites.some(p => p.importance === 'required');
              setShowPrerequisites(hasRequiredPrereqs);
            }

            // Set branches
            if (advancedPath.branches && advancedPath.branches.length > 0) {
              setBranches(advancedPath.branches);
            }
          } else {
            // Try to load as a legacy learning path
            const legacyPath = await getContentById(pathId);

            if (legacyPath) {
              setPathData({
                content: legacyPath.content,
                title: legacyPath.title,
                level: legacyPath.metadata?.level || 'intermediate',
                topic: legacyPath.metadata?.topic || '',
                citations: legacyPath.metadata?.citations || [],
                isLegacy: true
              });

              // Parse content to extract steps
              parsePathContent(legacyPath.content);
            } else {
              toast.error('Learning path not found');
            }
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
  }, [pathId, getLearningPathById, getContentById]);

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
      // Create an advanced learning path
      const newPath = await createLearningPath(topic, level);

      if (newPath) {
        setPathData(newPath);

        // Set steps from the path data
        if (newPath.steps && newPath.steps.length > 0) {
          setSteps(newPath.steps.map(step => ({
            ...step,
            label: step.title,
            description: step.content
          })));
        } else if (newPath.rawContent) {
          // Fallback to parsing raw content
          parsePathContent(newPath.rawContent);
        }

        // Set prerequisites
        if (newPath.prerequisites && newPath.prerequisites.length > 0) {
          setPrerequisites(newPath.prerequisites);
        }

        // Update URL to include the new path ID
        navigate(`/learning-path/${newPath._id}`, { replace: true });
      } else {
        // Fallback to legacy path creation if advanced creation fails
        const legacyPath = await generateBasicLearningPath(topic);

        if (legacyPath) {
          setPathData({
            content: legacyPath.content,
            title: `Learning Path: ${topic}`,
            level,
            topic,
            citations: legacyPath.citations || [],
            isLegacy: true
          });

          // Parse content to extract steps
          parsePathContent(legacyPath.content);

          // Update URL to include the new path ID
          if (legacyPath.pathId) {
            navigate(`/learning-path/${legacyPath.pathId}`, { replace: true });
          }
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

  // Save path to user's collection (for legacy paths)
  const handleSavePath = async () => {
    if (!pathData) return;

    try {
      // Only needed for legacy paths
      if (pathData.isLegacy) {
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
      }

      toast.success('Learning path saved to your collection');
    } catch (error) {
      console.error('Error saving learning path:', error);
      toast.error('Failed to save learning path');
    }
  };

  // Handle completing a step
  const handleCompleteStep = async (stepId) => {
    if (!pathData || pathData.isLegacy) return;

    try {
      const updatedPath = await completeStep(pathData._id, stepId);

      if (updatedPath) {
        setPathData(updatedPath);

        // Check if we should show a checkpoint
        if (updatedPath.shouldTakeCheckpoint) {
          // Find the next uncompleted checkpoint
          const nextCheckpoint = updatedPath.checkpoints.find(cp => !cp.completed);
          if (nextCheckpoint) {
            setCurrentCheckpoint(nextCheckpoint);
            setCheckpointAnswers(Array(nextCheckpoint.questions.length).fill(0));
            setCheckpointOpen(true);
          }
        }

        // Move to the next step
        if (activeStep < steps.length - 1) {
          handleNext();
        }
      }
    } catch (error) {
      console.error('Error completing step:', error);
      toast.error('Failed to mark step as completed');
    }
  };

  // Handle taking a checkpoint
  const handleTakeCheckpoint = async () => {
    if (!currentCheckpoint || !pathData || pathData.isLegacy) return;

    try {
      const result = await takeCheckpoint(
        pathData._id,
        currentCheckpoint._id,
        checkpointAnswers
      );

      if (result) {
        setPathData(result.path);
        setCheckpointOpen(false);

        // Show result
        const { score, passingScore } = result.checkpoint;
        if (score >= passingScore) {
          toast.success(`Checkpoint passed with a score of ${score}%!`);
        } else {
          toast.info(`You scored ${score}%. Review the material and try again to improve your understanding.`);
        }
      }
    } catch (error) {
      console.error('Error taking checkpoint:', error);
      toast.error('Failed to submit checkpoint answers');
    }
  };

  // Handle showing resources for a step
  const handleShowResources = (stepIndex) => {
    if (!steps[stepIndex]) return;

    const step = steps[stepIndex];
    if (step.resources && step.resources.length > 0) {
      setCurrentResources(step.resources);
      setResourcesOpen(true);
    } else {
      toast.info('No additional resources available for this step');
    }
  };

  // Handle menu open
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle creating a new branch
  const handleCreateBranch = async (branchData) => {
    if (!pathData || pathData.isLegacy) return;

    try {
      // Call API to create branch
      const response = await fetch(`/api/learning-paths/${pathData._id}/branches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          branchName: branchData.name,
          condition: branchData.condition,
          description: branchData.description
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create branch');
      }

      const updatedPath = await response.json();

      // Update path data and branches
      setPathData(updatedPath);
      if (updatedPath.branches) {
        setBranches(updatedPath.branches);
      }

      toast.success(`Branch "${branchData.name}" created successfully`);
    } catch (error) {
      console.error('Error creating branch:', error);
      toast.error('Failed to create branch');
    }
  };

  // Handle selecting a branch
  const handleSelectBranch = (branch) => {
    setActiveBranch(branch);

    // Find steps for this branch
    if (pathData && pathData.steps) {
      const branchSteps = pathData.steps.filter(step =>
        branch.steps.some(branchStepId => branchStepId === step._id)
      );

      if (branchSteps.length > 0) {
        setSteps(branchSteps.map(step => ({
          ...step,
          label: step.title,
          description: step.content
        })));
        setActiveStep(0);
      }
    }
  };

  // Handle returning to main path
  const handleReturnToMainPath = () => {
    setActiveBranch(null);

    // Reset to main path steps
    if (pathData && pathData.steps) {
      // Filter out branch steps
      const mainPathSteps = pathData.steps.filter(step =>
        !pathData.branches.some(branch =>
          branch.steps.some(branchStepId => branchStepId === step._id)
        )
      );

      if (mainPathSteps.length > 0) {
        setSteps(mainPathSteps.map(step => ({
          ...step,
          label: step.title,
          description: step.content
        })));
        setActiveStep(0);
      }
    }
  };

  // Handle learning a prerequisite
  const handleLearnPrerequisite = (prerequisite) => {
    // Create a new learning path for the prerequisite topic
    setTopic(prerequisite.topic);
    setLevel('beginner'); // Start with beginner level for prerequisites

    // Close prerequisites dialog if open
    setShowPrerequisites(false);

    // Submit the form to create a new learning path
    handleSubmit(new Event('submit'));
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
              {pathData.isLegacy && (
                <IconButton onClick={handleSavePath} title="Save Path">
                  <BookmarkIcon />
                </IconButton>
              )}
              <IconButton title="Share Path">
                <ShareIcon />
              </IconButton>
              <IconButton onClick={handleMenuOpen} title="More Options">
                <MoreIcon />
              </IconButton>
              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit Path</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleReset}>
                  <ListItemIcon>
                    <TimelineIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Reset Progress</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon>
                    <FlagIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Report Issue</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {pathData.title}
              {activeBranch && (
                <Chip
                  label={`Branch: ${activeBranch.name}`}
                  color="secondary"
                  sx={{ ml: 2, verticalAlign: 'middle' }}
                />
              )}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={pathData.level?.charAt(0).toUpperCase() + pathData.level?.slice(1) || 'Intermediate'}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`${steps.length} steps`}
                color="secondary"
                variant="outlined"
              />
              {!pathData.isLegacy && (
                <Chip
                  label={`${Math.round(pathData.progress || 0)}% complete`}
                  color="success"
                  variant="outlined"
                />
              )}
              {activeBranch && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleReturnToMainPath}
                  startIcon={<BackIcon />}
                >
                  Return to Main Path
                </Button>
              )}
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              This learning path is designed to guide you through {pathData.topic || 'this topic'} in a structured way.
              {!pathData.isLegacy && ' The path adapts based on your progress and performance.'}
            </Alert>

            {/* Tabs for different sections */}
            {!pathData.isLegacy && (
              <Box sx={{ mb: 3 }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Overview" />
                  {prerequisites.length > 0 && <Tab label="Prerequisites" />}
                  {branches.length > 0 && <Tab label="Branches" />}
                </Tabs>

                <Box sx={{ mt: 2 }}>
                  {/* Overview Tab */}
                  {activeTab === 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Overall Progress
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={pathData.progress || 0}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                  )}

                  {/* Prerequisites Tab */}
                  {activeTab === 1 && prerequisites.length > 0 && (
                    <PrerequisitesList
                      prerequisites={prerequisites}
                      onLearnPrerequisite={handleLearnPrerequisite}
                      showTitle={false}
                    />
                  )}

                  {/* Branches Tab */}
                  {activeTab === 2 && (
                    <BranchingPathsSelector
                      branches={branches}
                      onSelectBranch={handleSelectBranch}
                      onCreateBranch={handleCreateBranch}
                    />
                  )}
                </Box>
              </Box>
            )}

            {/* For legacy paths or when tabs are not shown */}
            {(pathData.isLegacy || activeTab === 0) && (
              <>
                {/* Prerequisites section for legacy paths */}
                {pathData.isLegacy && prerequisites.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Prerequisites
                    </Typography>
                    <List dense>
                      {prerequisites.map((prereq, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <SchoolIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={prereq.topic}
                            secondary={prereq.description}
                          />
                          {prereq.resourceUrl && (
                            <Button
                              size="small"
                              variant="outlined"
                              href={prereq.resourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Learn
                            </Button>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Progress bar for legacy paths */}
                {pathData.isLegacy && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Overall Progress
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={pathData.progress || 0}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                )}
              </>
            )}
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, position: 'sticky', top: 20 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">
                    Path Steps
                  </Typography>
                  {!pathData.isLegacy && (
                    <Chip
                      label={`${steps.filter(s => s.completed).length}/${steps.length} completed`}
                      size="small"
                      color="primary"
                    />
                  )}
                </Box>
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
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      onClick={() => setActiveStep(index)}
                    >
                      {!pathData.isLegacy && step.completed ? (
                        <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ mr: 1, color: activeStep === index ? 'white' : 'inherit' }} />
                      )}
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: activeStep === index ? 'bold' : 'normal',
                          color: activeStep === index ? 'white' : 'inherit',
                        }}
                      >
                        {index + 1}. {step.label || step.title}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                {activeStep < steps.length ? (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h5">
                        {steps[activeStep].label || steps[activeStep].title}
                      </Typography>

                      <Box>
                        {!pathData.isLegacy && steps[activeStep].resources && steps[activeStep].resources.length > 0 && (
                          <Tooltip title="View Resources">
                            <IconButton onClick={() => handleShowResources(activeStep)}>
                              <Badge badgeContent={steps[activeStep].resources.length} color="secondary">
                                <ResourceIcon />
                              </Badge>
                            </IconButton>
                          </Tooltip>
                        )}

                        {!pathData.isLegacy && steps[activeStep].quiz && steps[activeStep].quiz.length > 0 && (
                          <Tooltip title="Take Quiz">
                            <IconButton>
                              <QuizIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>

                    {!pathData.isLegacy && steps[activeStep].estimatedTimeMinutes && (
                      <Chip
                        icon={<TimelineIcon />}
                        label={`Estimated time: ${steps[activeStep].estimatedTimeMinutes} min`}
                        size="small"
                        sx={{ mb: 2 }}
                      />
                    )}

                    <Box sx={{ mb: 3 }}>
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
                        {steps[activeStep].description || steps[activeStep].content}
                      </ReactMarkdown>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        startIcon={<BackIcon />}
                      >
                        Previous
                      </Button>

                      <Box>
                        {!pathData.isLegacy && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => handleCompleteStep(steps[activeStep]._id)}
                            sx={{ mr: 1 }}
                            disabled={steps[activeStep].completed}
                          >
                            {steps[activeStep].completed ? 'Completed' : 'Mark Complete'}
                          </Button>
                        )}

                        <Button
                          variant="contained"
                          onClick={activeStep === steps.length - 1 ? handleReset : handleNext}
                        >
                          {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h5" gutterBottom>
                      Congratulations!
                    </Typography>
                    <Typography variant="body1" paragraph>
                      You&apos;ve completed all steps in this learning path.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleReset}
                      startIcon={<SchoolIcon />}
                    >
                      Start Over
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Checkpoint Dialog */}
          <Dialog
            open={checkpointOpen}
            onClose={() => setCheckpointOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Typography variant="h5">Knowledge Checkpoint</Typography>
            </DialogTitle>
            <DialogContent>
              {currentCheckpoint && (
                <Box>
                  <Typography variant="body1" paragraph>
                    Let&apos;s check your understanding of the material so far. Answer the following questions to continue.
                  </Typography>

                  {currentCheckpoint.questions.map((question, qIndex) => (
                    <Box key={qIndex} sx={{ mb: 4 }}>
                      <FormControl component="fieldset">
                        <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {qIndex + 1}. {question.question}
                        </FormLabel>
                        <RadioGroup
                          value={checkpointAnswers[qIndex]}
                          onChange={(e) => {
                            const newAnswers = [...checkpointAnswers];
                            newAnswers[qIndex] = parseInt(e.target.value);
                            setCheckpointAnswers(newAnswers);
                          }}
                        >
                          {question.options.map((option, oIndex) => (
                            <FormControlLabel
                              key={oIndex}
                              value={oIndex}
                              control={<Radio />}
                              label={option}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </Box>
                  ))}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCheckpointOpen(false)}>
                Skip for Now
              </Button>
              <Button
                variant="contained"
                onClick={handleTakeCheckpoint}
                disabled={!checkpointAnswers.every(a => a !== null)}
              >
                Submit Answers
              </Button>
            </DialogActions>
          </Dialog>

          {/* Resources Dialog */}
          <Dialog
            open={resourcesOpen}
            onClose={() => setResourcesOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Typography variant="h5">Additional Resources</Typography>
            </DialogTitle>
            <DialogContent>
              <List>
                {currentResources.map((resource, index) => (
                  <ListItem key={index} divider={index < currentResources.length - 1}>
                    <ListItemIcon>
                      {resource.type === 'video' && <PlayArrowIcon color="primary" />}
                      {resource.type === 'article' && <ArticleIcon color="primary" />}
                      {resource.type === 'book' && <ResourceIcon color="primary" />}
                      {resource.type === 'tool' && <BuildIcon color="primary" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={resource.title}
                      secondary={resource.description}
                    />
                    {resource.url && (
                      <Button
                        variant="outlined"
                        size="small"
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open
                      </Button>
                    )}
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setResourcesOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      ) : (
        <Typography>No learning path found</Typography>
      )}
    </Container>
  );
};

export default LearningPath;
