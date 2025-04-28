import React, { useState, useContext, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Divider,
} from '@mui/material';
import { PersonAddOutlined as PersonAddOutlinedIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import AuthContext from '../context/AuthContext';

const Register = () => {
  const { register, isAuthenticated, loading, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  const [localError, setLocalError] = useState('');
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Clear error when component unmounts
    return () => {
      clearError();
    };
  }, [isAuthenticated, navigate, clearError]);
  
  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name should be at least 2 characters')
      .max(50, 'Name should be less than 50 characters'),
    email: Yup.string()
      .email('Enter a valid email')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password should be at least 6 characters'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm your password'),
    level: Yup.string()
      .oneOf(['beginner', 'intermediate', 'advanced'], 'Select a valid learning level')
      .required('Learning level is required'),
    learningStyle: Yup.string()
      .oneOf(['visual', 'auditory', 'reading', 'kinesthetic', 'multimodal'], 'Select a valid learning style')
      .required('Learning style is required'),
  });
  
  // Form handler
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      level: 'intermediate',
      learningStyle: 'multimodal',
      topicsOfInterest: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLocalError('');
      
      // Format preferences
      const preferences = {
        level: values.level,
        learningStyle: values.learningStyle,
        topicsOfInterest: values.topicsOfInterest
          ? values.topicsOfInterest.split(',').map(topic => topic.trim())
          : [],
      };
      
      try {
        // Register user
        const userData = {
          name: values.name,
          email: values.email,
          password: values.password,
          preferences,
        };
        
        const success = await register(userData);
        
        if (success) {
          navigate('/dashboard');
        }
      } catch (err) {
        setLocalError('An unexpected error occurred. Please try again.');
      }
    }
  });
  
  return (
    <Container component="main" maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          marginTop: 8,
          marginBottom: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <PersonAddOutlinedIcon />
        </Avatar>
        
        <Typography component="h1" variant="h5">
          Create an Account
        </Typography>
        
        {(error || localError) && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error || localError}
          </Alert>
        )}
        
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <Grid container spacing={2}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            {/* Learning Preferences */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Learning Preferences
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.level && Boolean(formik.errors.level)}
              >
                <InputLabel id="level-label">Learning Level</InputLabel>
                <Select
                  labelId="level-label"
                  id="level"
                  name="level"
                  value={formik.values.level}
                  label="Learning Level"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
                {formik.touched.level && formik.errors.level && (
                  <FormHelperText>{formik.errors.level}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                error={formik.touched.learningStyle && Boolean(formik.errors.learningStyle)}
              >
                <InputLabel id="learning-style-label">Learning Style</InputLabel>
                <Select
                  labelId="learning-style-label"
                  id="learningStyle"
                  name="learningStyle"
                  value={formik.values.learningStyle}
                  label="Learning Style"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="visual">Visual</MenuItem>
                  <MenuItem value="auditory">Auditory</MenuItem>
                  <MenuItem value="reading">Reading/Writing</MenuItem>
                  <MenuItem value="kinesthetic">Kinesthetic</MenuItem>
                  <MenuItem value="multimodal">Multimodal (Mixed)</MenuItem>
                </Select>
                {formik.touched.learningStyle && formik.errors.learningStyle && (
                  <FormHelperText>{formik.errors.learningStyle}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="topicsOfInterest"
                name="topicsOfInterest"
                label="Topics of Interest (comma separated)"
                placeholder="e.g., Physics, Programming, History"
                value={formik.values.topicsOfInterest}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.topicsOfInterest && Boolean(formik.errors.topicsOfInterest)}
                helperText={
                  (formik.touched.topicsOfInterest && formik.errors.topicsOfInterest) ||
                  "Enter topics you're interested in learning about, separated by commas"
                }
              />
            </Grid>
          </Grid>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
