import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  Psychology as PsychologyIcon,
  Route as RouteIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';

const Home = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Learn Anything with AI
              </Typography>
              <Typography variant="h5" paragraph>
                Get personalized educational content with trusted sources and follow-up questions
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={RouterLink}
                  to="/register"
                  sx={{ mr: 2, mb: 2 }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  component={RouterLink}
                  to="/learn"
                  sx={{ mb: 2 }}
                >
                  Try It Now
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <SchoolIcon sx={{ fontSize: 200, opacity: 0.8 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Key Features
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          Everything you need for effective learning
        </Typography>
        <Divider sx={{ mb: 6 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <PsychologyIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  AI-Powered Learning
                </Typography>
                <Typography variant="body1">
                  Get comprehensive answers to any educational query with reputable sources and citations.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <RouteIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  Learning Paths
                </Typography>
                <Typography variant="body1">
                  Generate customized learning paths for any topic based on your knowledge level.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <VerifiedUserIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  Trusted Sources
                </Typography>
                <Typography variant="body1">
                  All responses include citations from trusted sources to ensure accuracy and reliability.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <SchoolIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  Progress Tracking
                </Typography>
                <Typography variant="body1">
                  Monitor your learning history and revisit previous topics to reinforce your knowledge.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8, mb: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            How It Works
          </Typography>
          <Divider sx={{ mb: 6 }} />

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h4" component="h3" align="center" gutterBottom>
                  1
                </Typography>
                <Typography variant="h6" align="center" gutterBottom>
                  Ask Any Question
                </Typography>
                <Typography variant="body1" align="center">
                  Type in any educational question you have, from basic concepts to advanced topics.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h4" component="h3" align="center" gutterBottom>
                  2
                </Typography>
                <Typography variant="h6" align="center" gutterBottom>
                  Get Comprehensive Answers
                </Typography>
                <Typography variant="body1" align="center">
                  Receive detailed explanations with citations from trusted sources and follow-up questions.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h4" component="h3" align="center" gutterBottom>
                  3
                </Typography>
                <Typography variant="h6" align="center" gutterBottom>
                  Deepen Your Understanding
                </Typography>
                <Typography variant="body1" align="center">
                  Explore related topics, save content for later, and track your learning progress.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ mb: 8, textAlign: 'center' }}>
        <Typography variant="h3" component="h2" gutterBottom>
          Ready to Start Learning?
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Join thousands of learners expanding their knowledge with LearnSphere
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={RouterLink}
          to="/register"
          sx={{ mt: 2 }}
        >
          Create Free Account
        </Button>
      </Container>
    </Box>
  );
};

export default Home;
