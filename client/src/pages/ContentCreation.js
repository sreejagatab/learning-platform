import React from 'react';
import { Container, Typography, Box, Paper, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ContentCreationForm from '../components/ContentCreationForm';
import './ContentCreation.css';

const ContentCreation = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Home
          </Link>
          <Link component={RouterLink} to="/dashboard" color="inherit">
            Dashboard
          </Link>
          <Typography color="text.primary">Create Content</Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 3, mb: 4, bgcolor: '#f8f9fa' }} elevation={0}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create New Content
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Create and save your learning materials, notes, articles, and more. Use the rich text editor to format your content and add media.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Switch to the Preview tab to see how your content will look before saving.
          </Typography>
        </Paper>
      </Box>

      <ContentCreationForm />
    </Container>
  );
};

export default ContentCreation;
