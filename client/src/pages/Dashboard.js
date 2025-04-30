import React, { useContext, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  CircularProgress,
  Chip,
  Alert,
} from '@mui/material';
import {
  School as SchoolIcon,
  History as HistoryIcon,
  BookmarkBorder as BookmarkIcon,
  TrendingUp as TrendingIcon,
  Psychology as PsychologyIcon,
  Route as RouteIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Insights as InsightsIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import AuthContext from '../context/AuthContext';
import LearningContext from '../context/LearningContext';
import GamificationContext from '../context/GamificationContext';
import AnalyticsContext from '../context/AnalyticsContext';
import { GamificationSummary } from '../components/gamification';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const {
    getUserContent,
    getLearningHistory,
    contentLoading,
    historyLoading,
  } = useContext(LearningContext);
  const { recordActivity } = useContext(GamificationContext);
  const {
    trackPageView,
    recommendations,
    fetchRecommendations,
    getRecommendationsByType
  } = useContext(AnalyticsContext);

  const [recentContent, setRecentContent] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [learningStats, setLearningStats] = useState({
    totalSessions: 0,
    totalQuestions: 0,
    savedContent: 0,
    topTopics: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];

  useEffect(() => {
    // Only fetch data once when the component mounts
    const controller = new AbortController();
    let isMounted = true;

    const fetchDashboardData = async () => {
      // Only fetch if data hasn't been fetched yet or if there was an error
      if (!dataFetched || error) {
        setLoading(true);
        setError(null);

        try {
          // Get recent content (notes, paths, etc.)
          const contentData = await getUserContent(null, 1, 5);

          // Only update state if component is still mounted
          if (isMounted) {
            setRecentContent(contentData.content || []);

            // Get recent history
            const historyData = await getLearningHistory(1, 5);

            if (isMounted) {
              setRecentHistory(historyData.history || []);

              // Calculate learning stats
              const stats = {
                totalSessions: historyData.pagination?.total || 0,
                totalQuestions: calculateTotalQuestions(historyData.history || []),
                savedContent: contentData.pagination?.total || 0,
                topTopics: extractTopTopics(historyData.history || [])
              };

              setLearningStats(stats);
              setDataFetched(true);

              // Record dashboard visit for gamification
              recordActivity('dashboard_visit', 0, { source: 'dashboard' });

              // Track page view for analytics
              trackPageView('dashboard');

              // Fetch recommendations
              fetchRecommendations();
            }
          }
        } catch (err) {
          // Ignore aborted requests
          if (err.name === 'AbortError') {
            console.log('Request was aborted');
            return;
          }

          console.error('Error fetching dashboard data:', err);
          if (isMounted) {
            setError('Failed to load dashboard data. Please try again.');
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };

    // Execute the fetch function once
    fetchDashboardData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      controller.abort();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this effect runs once on mount

  // Add a separate effect to handle retries when error state changes
  useEffect(() => {
    if (error) {
      // This effect will run when the error state changes
      console.log('Error state changed, ready for retry');
    }
  }, [error]);

  // Function to manually refresh data
  const handleRefresh = () => {
    setDataFetched(false); // This will trigger the useEffect to run again
  };

  // Calculate total questions (main + follow-ups)
  const calculateTotalQuestions = (history) => {
    return history.reduce((total, item) => {
      return total + 1 + (item.followUps?.length || 0);
    }, 0);
  };

  // Extract top topics from history
  const extractTopTopics = (history) => {
    const topicMap = {};

    // Extract topics from queries
    history.forEach(item => {
      const query = item.query.toLowerCase();
      const words = query.split(' ');

      // Simple topic extraction - use first few words or known subjects
      let topic = '';

      if (query.includes('what is') || query.includes('explain')) {
        const index = query.includes('what is')
          ? query.indexOf('what is') + 8
          : query.indexOf('explain') + 8;

        topic = query.substring(index).split(' ').slice(0, 3).join(' ');
      } else {
        topic = words.slice(0, Math.min(3, words.length)).join(' ');
      }

      // Count occurrences
      topicMap[topic] = (topicMap[topic] || 0) + 1;
    });

    // Convert to array and sort
    const topTopics = Object.entries(topicMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return topTopics;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (loading || contentLoading || historyLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>

        <Typography variant="h4" component="h1" gutterBottom>
          {user?.name}&apos;s Learning Dashboard
        </Typography>

        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            We&apos;re having trouble loading your dashboard data.
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ mt: 2 }}
          >
            Refresh Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {user?.name}&apos;s Learning Dashboard
      </Typography>

      {/* Gamification Summary */}
      <GamificationSummary />

      {/* Featured Actions */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'primary.light',
          color: 'primary.contrastText'
        }}
      >
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Create New Content
          </Typography>
          <Typography variant="body1">
            Create notes, articles, learning paths and more with our rich text editor.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          component={RouterLink}
          to="/content/create"
          startIcon={<AddIcon />}
          sx={{
            px: 3,
            py: 1.5,
            fontWeight: 'bold',
            boxShadow: 3
          }}
        >
          Create Content
        </Button>
      </Paper>

      {/* Stats overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: 140,
            }}
          >
            <SchoolIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography component="p" variant="h4">
              {learningStats.totalSessions}
            </Typography>
            <Typography color="text.secondary">
              Learning Sessions
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: 140,
            }}
          >
            <PsychologyIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography component="p" variant="h4">
              {learningStats.totalQuestions}
            </Typography>
            <Typography color="text.secondary">
              Questions Asked
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: 140,
            }}
          >
            <BookmarkIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography component="p" variant="h4">
              {learningStats.savedContent}
            </Typography>
            <Typography color="text.secondary">
              Saved Items
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: 140,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/learn"
              startIcon={<SchoolIcon />}
              sx={{ mb: 1 }}
            >
              Start Learning
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              component={RouterLink}
              to="/history"
              startIcon={<HistoryIcon />}
            >
              View History
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Main dashboard content */}
      <Grid container spacing={3}>
        {/* Left column */}
        <Grid item xs={12} md={8}>
          {/* Recent learning history */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom component="div">
              Recent Learning Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {recentHistory.length > 0 ? (
              <List>
                {recentHistory.map((item, index) => (
                  <React.Fragment key={item._id || index}>
                    <ListItem>
                      <ListItemIcon>
                        <PsychologyIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.query}
                        secondary={`${formatDate(item.queryTimestamp)} • ${item.followUps?.length || 0} follow-ups`}
                      />
                    </ListItem>
                    {index < recentHistory.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography color="text.secondary">
                  No learning history yet. Start by asking a question!
                </Typography>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/learn"
                  sx={{ mt: 2 }}
                >
                  Ask Your First Question
                </Button>
              </Box>
            )}
          </Paper>

          {/* Saved content */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom component="div">
              Your Learning Materials
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {recentContent.length > 0 ? (
              <Grid container spacing={2}>
                {recentContent.map((content, index) => (
                  <Grid item xs={12} sm={6} key={content._id || index}>
                    <Card variant="outlined">
                      <CardContent sx={{ pb: 1 }}>
                        <Box sx={{ display: 'flex', mb: 1 }}>
                          <Chip
                            size="small"
                            label={content.type.replace('_', ' ')}
                            color={content.type === 'learning_path' ? 'secondary' : 'primary'}
                          />
                        </Box>
                        <Typography variant="h6" component="div" noWrap>
                          {content.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Saved on {formatDate(content.createdAt)}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          component={RouterLink}
                          to={`/content/${content._id}`}
                        >
                          View
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography color="text.secondary">
                  You haven&apos;t saved any content yet
                </Typography>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/learn"
                  sx={{ mt: 2 }}
                >
                  Start Learning
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right column */}
        <Grid item xs={12} md={4}>
          {/* Topics chart */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Learning Topics
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {learningStats.topTopics.length > 0 ? (
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={learningStats.topTopics}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {learningStats.topTopics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} questions`, 'Frequency']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="text.secondary">
                  Not enough data to analyze topics
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Recommendations */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recommended for You
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {getRecommendationsByType('content', 3).length > 0 ? (
              <List dense>
                {getRecommendationsByType('content', 3).map((rec, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton component={RouterLink} to={`/content/${rec.item}`}>
                      <ListItemIcon>
                        <VisibilityIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={rec.content?.title || `Recommended Content ${index + 1}`}
                        secondary={rec.reason}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}

                <Divider sx={{ my: 1 }} />

                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/analytics">
                    <ListItemIcon>
                      <InsightsIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="View All Recommendations"
                      secondary="See personalized insights and more recommendations"
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography color="text.secondary">
                  Continue learning to get personalized recommendations
                </Typography>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/analytics"
                  sx={{ mt: 2 }}
                >
                  View Analytics
                </Button>
              </Box>
            )}
          </Paper>

          {/* Quick actions */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RouteIcon />}
                component={RouterLink}
                to="/learning-path/create"
                fullWidth
              >
                Create Learning Path
              </Button>

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                component={RouterLink}
                to="/content/create"
                fullWidth
              >
                Create New Content
              </Button>

              <Button
                variant="outlined"
                startIcon={<BookmarkIcon />}
                component={RouterLink}
                to="/content"
                fullWidth
              >
                Browse Saved Content
              </Button>

              <Button
                variant="outlined"
                startIcon={<InsightsIcon />}
                component={RouterLink}
                to="/analytics"
                fullWidth
              >
                View Learning Analytics
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
