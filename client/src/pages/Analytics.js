import React, { useContext, useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Recommend as RecommendIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  BubbleChart as BubbleChartIcon,
  Visibility as VisibilityIcon,
  AccessTime as AccessTimeIcon,
  Search as SearchIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Create as CreateIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import AnalyticsContext from '../context/AnalyticsContext';
import AuthContext from '../context/AuthContext';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Analytics = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const {
    learningProgress,
    userInsights,
    recommendations,
    loading,
    error,
    fetchLearningProgress,
    fetchUserInsights,
    fetchRecommendations,
    fetchActivityHistory,
    trackPageView,
    getPreferredTopics,
    getStrengths,
    getAreasForImprovement,
    getLearningStyle,
    getRecommendationsByType
  } = useContext(AnalyticsContext);

  const [tabValue, setTabValue] = useState(0);
  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    // Track page view
    trackPageView('analytics');
    
    // Fetch all analytics data
    fetchLearningProgress();
    fetchUserInsights();
    fetchRecommendations();
    
    // Generate sample activity data for charts
    generateSampleActivityData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Generate sample activity data for charts
  const generateSampleActivityData = () => {
    // Last 7 days activity
    const dailyActivity = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      dailyActivity.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sessions: Math.floor(Math.random() * 5),
        questions: Math.floor(Math.random() * 10),
        content: Math.floor(Math.random() * 3)
      });
    }
    
    setActivityData(dailyActivity);
  };

  // Get learning style description
  const getLearningStyleDescription = (style) => {
    switch (style) {
      case 'visual':
        return 'You learn best through visual aids like images, videos, and diagrams.';
      case 'auditory':
        return 'You learn best through listening and verbal communication.';
      case 'reading':
        return 'You learn best through reading and writing text-based content.';
      case 'kinesthetic':
        return 'You learn best through hands-on activities and interactive exercises.';
      case 'multimodal':
        return 'You have a balanced learning style that adapts to different content types.';
      default:
        return 'Your learning style is still being analyzed based on your activity.';
    }
  };

  // COLORS for charts
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Learning Analytics
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="body1">
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Learning Analytics & Insights
      </Typography>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<TrendingUpIcon />} label="Overview" />
          <Tab icon={<LightbulbIcon />} label="Insights" />
          <Tab icon={<RecommendIcon />} label="Recommendations" />
          <Tab icon={<TimelineIcon />} label="Progress" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h5" gutterBottom>
            Learning Overview
          </Typography>
          
          <Grid container spacing={3}>
            {/* Activity Summary */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={activityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sessions" name="Learning Sessions" fill={theme.palette.primary.main} />
                    <Bar dataKey="questions" name="Questions Asked" fill={theme.palette.secondary.main} />
                    <Bar dataKey="content" name="Content Created" fill={theme.palette.success.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            {/* Learning Style */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Your Learning Style
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                  <PieChart width={200} height={200}>
                    <Pie
                      data={[
                        { name: 'Visual', value: userInsights?.learningStyle === 'visual' ? 100 : 20 },
                        { name: 'Reading', value: userInsights?.learningStyle === 'reading' ? 100 : 20 },
                        { name: 'Kinesthetic', value: userInsights?.learningStyle === 'kinesthetic' ? 100 : 20 },
                        { name: 'Multimodal', value: userInsights?.learningStyle === 'multimodal' ? 100 : 20 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[0, 1, 2, 3].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                  
                  <Typography variant="h6" sx={{ mt: 2, textTransform: 'capitalize' }}>
                    {getLearningStyle() || 'Multimodal'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    {getLearningStyleDescription(getLearningStyle())}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            {/* Topic Progress */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Topic Progress
                </Typography>
                
                <Grid container spacing={2}>
                  {learningProgress && learningProgress.length > 0 ? (
                    learningProgress.map((progress) => (
                      <Grid item xs={12} sm={6} md={4} key={progress._id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              {progress.topic}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={progress.overallProgress} 
                                  color={progress.overallProgress > 70 ? "success" : "primary"}
                                  sx={{ height: 10, borderRadius: 5 }}
                                />
                              </Box>
                              <Box sx={{ minWidth: 35 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {progress.overallProgress}%
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Typography variant="caption" color="text.secondary">
                              Time spent: {Math.round(progress.timeSpent / 60)} minutes
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                        No topic progress data available yet. Start learning to see your progress!
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Insights Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" gutterBottom>
            Learning Insights
          </Typography>
          
          <Grid container spacing={3}>
            {/* Preferred Topics */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StarIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Your Preferred Topics
                  </Typography>
                </Box>
                
                <List>
                  {getPreferredTopics(5).length > 0 ? (
                    getPreferredTopics(5).map((topic, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <SchoolIcon color={index < 3 ? "primary" : "action"} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={topic.topic} 
                          secondary={`Interest level: ${topic.score}%`}
                        />
                        <LinearProgress 
                          variant="determinate" 
                          value={topic.score} 
                          sx={{ width: 100, height: 8, borderRadius: 4 }}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                      Continue learning to discover your preferred topics.
                    </Typography>
                  )}
                </List>
              </Paper>
            </Grid>
            
            {/* Strengths & Areas for Improvement */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Strengths & Areas for Improvement
                  </Typography>
                </Box>
                
                <Typography variant="subtitle2" color="success.main" sx={{ mt: 2, mb: 1 }}>
                  Your Strengths
                </Typography>
                
                <List dense>
                  {getStrengths(3).length > 0 ? (
                    getStrengths(3).map((strength, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ArrowUpIcon color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={strength.topic} 
                          secondary={`Proficiency: ${strength.score}%`}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                      Keep learning to identify your strengths.
                    </Typography>
                  )}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" color="error.main" sx={{ mt: 2, mb: 1 }}>
                  Areas for Improvement
                </Typography>
                
                <List dense>
                  {getAreasForImprovement(3).length > 0 ? (
                    getAreasForImprovement(3).map((area, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ArrowDownIcon color="error" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={area.topic} 
                          secondary={`Current level: ${100 - area.score}%`}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                      Continue learning to identify areas for improvement.
                    </Typography>
                  )}
                </List>
              </Paper>
            </Grid>
            
            {/* Learning Patterns */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Learning Patterns
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Preferred Time
                        </Typography>
                        <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>
                          {userInsights?.learningPatterns?.preferredTimeOfDay || 'Varied'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Avg. Session Duration
                        </Typography>
                        <Typography variant="h5">
                          {userInsights?.learningPatterns?.averageSessionDuration 
                            ? Math.round(userInsights.learningPatterns.averageSessionDuration / 60) 
                            : 0} min
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Sessions per Week
                        </Typography>
                        <Typography variant="h5">
                          {userInsights?.learningPatterns?.sessionsPerWeek || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Consistency Score
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h5">
                            {userInsights?.learningPatterns?.consistencyScore || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            /100
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Recommendations Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h5" gutterBottom>
            Personalized Recommendations
          </Typography>
          
          <Grid container spacing={3}>
            {/* Content Recommendations */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <VisibilityIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Recommended Content
                  </Typography>
                </Box>
                
                <List>
                  {getRecommendationsByType('content', 5).length > 0 ? (
                    getRecommendationsByType('content', 5).map((rec, index) => (
                      <ListItem key={index} alignItems="flex-start">
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" component={RouterLink} to={`/content/${rec.item}`} sx={{ textDecoration: 'none' }}>
                              {rec.content?.title || `Content ${index + 1}`}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary" component="span">
                                {rec.reason}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Chip 
                                  size="small" 
                                  label={`Relevance: ${rec.score}%`} 
                                  color="primary" 
                                  variant="outlined"
                                />
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                      No content recommendations available yet. Continue learning to get personalized suggestions.
                    </Typography>
                  )}
                </List>
              </Paper>
            </Grid>
            
            {/* Topic Recommendations */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SchoolIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Recommended Topics
                  </Typography>
                </Box>
                
                <List>
                  {getRecommendationsByType('topic', 5).length > 0 ? (
                    getRecommendationsByType('topic', 5).map((rec, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={rec.item}
                          secondary={rec.reason}
                        />
                        <Button 
                          variant="outlined" 
                          size="small" 
                          component={RouterLink} 
                          to={`/learn?topic=${encodeURIComponent(rec.item)}`}
                        >
                          Explore
                        </Button>
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                      No topic recommendations available yet. Continue learning to get personalized suggestions.
                    </Typography>
                  )}
                </List>
              </Paper>
            </Grid>
            
            {/* Feature Recommendations */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LightbulbIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Recommended Features to Try
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  {getRecommendationsByType('feature', 6).length > 0 ? (
                    getRecommendationsByType('feature', 6).map((rec, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                              {rec.item.replace('_', ' ')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {rec.reason}
                            </Typography>
                            <Button 
                              variant="contained" 
                              size="small" 
                              color="primary"
                              component={RouterLink}
                              to={getFeatureLink(rec.item)}
                            >
                              Try Now
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                        No feature recommendations available yet. Continue using the platform to get personalized suggestions.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Progress Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h5" gutterBottom>
            Learning Progress
          </Typography>
          
          <Grid container spacing={3}>
            {/* Progress Overview */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Progress Overview
                </Typography>
                
                {learningProgress && learningProgress.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={learningProgress.map(p => ({
                        topic: p.topic,
                        progress: p.overallProgress,
                        timeSpent: Math.round(p.timeSpent / 60) // Convert to minutes
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="topic" />
                      <YAxis yAxisId="left" orientation="left" stroke={theme.palette.primary.main} />
                      <YAxis yAxisId="right" orientation="right" stroke={theme.palette.secondary.main} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="progress" name="Progress (%)" fill={theme.palette.primary.main} />
                      <Bar yAxisId="right" dataKey="timeSpent" name="Time Spent (min)" fill={theme.palette.secondary.main} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                    No progress data available yet. Start learning to see your progress!
                  </Typography>
                )}
              </Paper>
            </Grid>
            
            {/* Detailed Progress */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Detailed Topic Progress
                </Typography>
                
                {learningProgress && learningProgress.length > 0 ? (
                  <Grid container spacing={2}>
                    {learningProgress.map((progress) => (
                      <Grid item xs={12} key={progress._id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {progress.topic}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={progress.overallProgress} 
                                  color={progress.overallProgress > 70 ? "success" : "primary"}
                                  sx={{ height: 10, borderRadius: 5 }}
                                />
                              </Box>
                              <Box sx={{ minWidth: 35 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {progress.overallProgress}%
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Typography variant="subtitle2" gutterBottom>
                              Subtopics:
                            </Typography>
                            
                            {progress.subtopics && progress.subtopics.length > 0 ? (
                              <Grid container spacing={2}>
                                {progress.subtopics.map((subtopic, index) => (
                                  <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Box sx={{ mb: 1 }}>
                                      <Typography variant="body2">
                                        {subtopic.name}
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box sx={{ width: '100%', mr: 1 }}>
                                          <LinearProgress 
                                            variant="determinate" 
                                            value={subtopic.progress} 
                                            sx={{ height: 6, borderRadius: 3 }}
                                          />
                                        </Box>
                                        <Box sx={{ minWidth: 35 }}>
                                          <Typography variant="caption" color="text.secondary">
                                            {subtopic.progress}%
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </Box>
                                  </Grid>
                                ))}
                              </Grid>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No subtopics available for this topic.
                              </Typography>
                            )}
                            
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">
                                Time spent: {Math.round(progress.timeSpent / 60)} minutes
                              </Typography>
                              
                              <Typography variant="body2" color="text.secondary">
                                Last activity: {new Date(progress.lastActivity).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                    No detailed progress data available yet. Start learning to see your progress!
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
};

// Helper function to get link for feature recommendations
const getFeatureLink = (feature) => {
  switch (feature) {
    case 'content_creation':
      return '/content/create';
    case 'search':
      return '/learn';
    case 'question_asking':
      return '/learn';
    case 'learning_paths':
      return '/learning-path';
    case 'notes':
      return '/profile';
    case 'bookmarks':
      return '/history';
    default:
      return '/dashboard';
  }
};

export default Analytics;
