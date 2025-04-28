import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              LearnSphere
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Personalized learning powered by Perplexity Sonar API
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Links
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" display="block" sx={{ mb: 1 }}>
              Home
            </Link>
            <Link component={RouterLink} to="/learn" color="inherit" display="block" sx={{ mb: 1 }}>
              Start Learning
            </Link>
            <Link component={RouterLink} to="/dashboard" color="inherit" display="block" sx={{ mb: 1 }}>
              Dashboard
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              About
            </Typography>
            <Typography variant="body2" color="text.secondary">
              LearnSphere is a personalized learning platform built with Perplexity's Sonar API, providing in-depth explanations on any topic with follow-up questions.
            </Typography>
          </Grid>
        </Grid>
        
        <Box mt={5}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            <Link component={RouterLink} to="/" color="inherit">
              LearnSphere
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
