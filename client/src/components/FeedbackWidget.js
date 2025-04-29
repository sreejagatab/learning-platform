import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Rating,
  Typography,
  Snackbar,
  Alert,
  Fab,
  Tooltip
} from '@mui/material';
import { Feedback as FeedbackIcon } from '@mui/icons-material';
import { useAnalytics } from '../context/AnalyticsContext';

/**
 * Feedback widget component that allows users to provide feedback
 * about the application or specific features
 */
const FeedbackWidget = ({ feature = 'general' }) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { trackFeatureUse } = useAnalytics();

  const handleOpen = () => {
    setOpen(true);
    trackFeatureUse('feedback_widget_opened', { feature });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', { feature, rating, comment });
    
    // Track the feedback submission in analytics
    trackFeatureUse('feedback_submitted', { 
      feature, 
      rating,
      commentLength: comment.length
    });
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Thank you for your feedback!',
      severity: 'success'
    });
    
    // Reset form
    setRating(0);
    setComment('');
    
    // Close dialog
    setOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Tooltip title="Give Feedback">
        <Fab
          color="primary"
          size="medium"
          onClick={handleOpen}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000
          }}
        >
          <FeedbackIcon />
        </Fab>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>We Value Your Feedback</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please share your thoughts about {feature === 'general' ? 'LearnSphere' : `the ${feature} feature`}. 
            Your feedback helps us improve!
          </DialogContentText>
          
          <Box sx={{ my: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="legend">How would you rate your experience?</Typography>
            <Rating
              name="feedback-rating"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
              size="large"
              sx={{ mt: 1 }}
            />
          </Box>
          
          <TextField
            autoFocus
            margin="dense"
            id="feedback-comment"
            label="Your comments (optional)"
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={rating === 0}
          >
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FeedbackWidget;
