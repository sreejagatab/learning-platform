import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Chip,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  IconButton,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Send as SendIcon,
  BookmarkAdd as BookmarkIcon,
  ExpandMore as ExpandMoreIcon,
  Link as LinkIcon,
  RefreshOutlined as RefreshIcon,
  CreateNewFolder as PathIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'react-toastify';

import LearningContext from '../context/LearningContext';
import AuthContext from '../context/AuthContext';

const Learn = () => {
  const {
    askQuestion,
    askFollowUpQuestion,
    clearSession,
    saveContent,
    generateLearningPath,
    currentQuery,
    currentResponse,
    queryLoading,
    queryError,
    sessionMessages,
    followUpQuestions,
    citations,
    userLevel,
    updateUserLevel,
  } = useContext(LearningContext);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [query, setQuery] = useState('');
  const [selectedFollowUp, setSelectedFollowUp] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [level, setLevel] = useState(userLevel || 'intermediate');
  
  const messageEndRef = useRef(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessionMessages]);
  
  // Update level when user changes it
  useEffect(() => {
    updateUserLevel(level);
  }, [level, updateUserLevel]);
  
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error('Please enter a question');
      return;
    }
    
    // Ask the question
    await askQuestion(query, { level });
    
    // Clear the input
    setQuery('');
  };
  
  const handleFollowUpClick = async (followUp) => {
    setSelectedFollowUp(followUp);
    await askFollowUpQuestion(followUp);
    setSelectedFollowUp('');
  };
  
  const handleSaveContent = async () => {
    if (!currentResponse) {
      toast.error('No content to save');
      return;
    }
    
    const title = currentQuery.length > 50 
      ? `${currentQuery.substring(0, 50)}...` 
      : currentQuery;
    
    const metadata = {
      query: currentQuery,
      citations,
      level
    };
    
    const contentId = await saveContent(title, currentResponse, 'note', metadata);
    
    if (contentId) {
      toast.success('Content saved to your notes');
    }
  };
  
  const handleCreateLearningPath = async () => {
    if (!currentQuery) {
      toast.error('Please ask a question first');
      return;
    }
    
    // Extract main topic from query
    const topic = currentQuery.split(' ').length > 3 
      ? currentQuery.split(' ').slice(0, 3).join(' ') 
      : currentQuery;
    
    const pathData = await generateLearningPath(topic);
    
    if (pathData && pathData.pathId) {
      navigate(`/learning-path/${pathData.pathId}`);
    }
  };
  
  const handleClearSession = () => {
    clearSession();
    toast.info('Learning session cleared');
  };
  
  const handleLevelChange = (e) => {
    setLevel(e.target.value);
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Main content area */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, minHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
            {/* Chat header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" component="h1" gutterBottom>
                Learn Anything
              </Typography>
              <Box>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="level-select-label">Learning Level</InputLabel>
                  <Select
                    labelId="level-select-label"
                    id="level-select"
                    value={level}
                    onChange={handleLevelChange}
                    label="Learning Level"
                  >
                    <MenuItem value="beginner">Beginner</MenuItem>
                    <MenuItem value="intermediate">Intermediate</MenuItem>
                    <MenuItem value="advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
                <IconButton 
                  color="primary" 
                  onClick={handleClearSession}
                  title="Clear Session"
                  sx={{ ml: 1 }}
                >
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {/* Chat messages */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
              {sessionMessages.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '50vh',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Ask any question to start learning
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Get in-depth explanations with citations and follow-up questions
                  </Typography>
                </Box>
              ) : (
                sessionMessages.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 2,
                      p: 2,
                      backgroundColor: message.role === 'user' 
                        ? 'rgba(25, 118, 210, 0.05)' 
                        : 'white',
                      borderRadius: 2,
                      maxWidth: '100%',
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      {message.role === 'user' ? 'You' : 'LearnSphere'}
                    </Typography>
                    
                    {message.role === 'user' ? (
                      <Typography variant="body1">{message.content}</Typography>
                    ) : (
                      <Box>
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
                          {message.content}
                        </ReactMarkdown>
                      </Box>
                    )}
                  </Box>
                ))
              )}
              <div ref={messageEndRef} />
            </Box>
            
            {/* Input area */}
            <Box component="form" onSubmit={handleQuerySubmit}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask anything about any topic..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={queryLoading}
                InputProps={{
                  endAdornment: (
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={queryLoading || !query.trim()}
                      sx={{ ml: 1 }}
                    >
                      {queryLoading ? <CircularProgress size={24} /> : <SendIcon />}
                    </Button>
                  ),
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Follow-up questions */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Follow-up Questions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {followUpQuestions && followUpQuestions.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {followUpQuestions.map((followUp, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleFollowUpClick(followUp)}
                    disabled={queryLoading || selectedFollowUp === followUp}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                  >
                    {followUp}
                  </Button>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {currentResponse 
                  ? 'No follow-up questions available' 
                  : 'Ask a question to see follow-up suggestions'}
              </Typography>
            )}
          </Paper>
          
          {/* Action buttons */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<BookmarkIcon />}
              onClick={handleSaveContent}
              disabled={!currentResponse}
              sx={{ mb: 2 }}
            >
              Save to Notes
            </Button>
            
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              startIcon={<PathIcon />}
              onClick={handleCreateLearningPath}
              disabled={!currentQuery}
            >
              Create Learning Path
            </Button>
          </Paper>
          
          {/* Citations */}
          {citations && citations.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Sources & Citations
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>
                    {citations.length} {citations.length === 1 ? 'Source' : 'Sources'}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {citations.map((citation, index) => (
                      <Card key={index} variant="outlined">
                        <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                          <Typography variant="subtitle2">
                            {citation.title || 'Unknown Source'}
                          </Typography>
                          
                          {citation.snippet && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {citation.snippet.length > 150 
                                ? `${citation.snippet.substring(0, 150)}...` 
                                : citation.snippet}
                            </Typography>
                          )}
                          
                          {citation.url && (
                            <Link 
                              href={citation.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                mt: 1,
                                fontSize: '0.875rem'
                              }}
                            >
                              <LinkIcon fontSize="small" sx={{ mr: 0.5 }} />
                              Visit Source
                            </Link>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Learn;
