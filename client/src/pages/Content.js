import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import LearningContext from '../context/LearningContext';

const Content = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const { getContentById, contentLoading } = useContext(LearningContext);

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getContentById(contentId);
        if (data) {
          setContent(data);
        } else {
          setError('Content not found');
        }
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentId, getContentById]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (loading || contentLoading) {
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
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>

        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!content) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Content not found
        </Alert>

        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        <Box>
          <Button
            startIcon={<AddIcon />}
            color="primary"
            component={RouterLink}
            to="/content/create"
            sx={{ mr: 1 }}
          >
            Create New
          </Button>
          <Button
            startIcon={<EditIcon />}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            color="error"
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {content.title}
          </Typography>

          <Chip
            label={content.type?.replace('_', ' ') || 'Note'}
            color={content.type === 'learning_path' ? 'secondary' : 'primary'}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          Created on {formatDate(content.createdAt)}
          {content.updatedAt !== content.createdAt && ` • Updated on ${formatDate(content.updatedAt)}`}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mt: 3 }}>
          <ReactMarkdown>
            {content.content}
          </ReactMarkdown>
        </Box>

        {content.metadata?.citations && content.metadata.citations.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Sources
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {content.metadata.citations.map((citation, index) => (
              <Box key={citation.id || index} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                  {citation.title}
                </Typography>
                {citation.url && (
                  <Typography variant="body2" component="a" href={citation.url} target="_blank" rel="noopener noreferrer">
                    {citation.url}
                  </Typography>
                )}
                {citation.snippet && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {citation.snippet}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Content;
