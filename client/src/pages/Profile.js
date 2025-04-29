import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  TextField,
  Button,
  Grid,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

import AuthContext from '../context/AuthContext';
import LearningContext from '../context/LearningContext';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
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

const Profile = () => {
  const { user, updateProfile, changePassword, loading: authLoading } = useContext(AuthContext);
  const { userLevel, updateUserLevel } = useContext(LearningContext);

  const [activeTab, setActiveTab] = useState(0);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [preferences, setPreferences] = useState({
    level: userLevel || 'intermediate',
    emailNotifications: true,
    saveHistory: true,
    darkMode: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
      });

      // Load preferences if available
      if (user.preferences) {
        setPreferences(prevPreferences => ({
          ...prevPreferences,
          ...user.preferences,
        }));
      }
    }
  }, [user]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  // Handle preferences changes
  const handlePreferenceChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === 'checkbox' ? checked : value;

    setPreferences({
      ...preferences,
      [name]: newValue,
    });

    // Update learning level in context if changed
    if (name === 'level' && value !== userLevel) {
      updateUserLevel(value);
    }
  };

  // Submit profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const success = await updateProfile({
        ...profileData,
        preferences,
      });

      if (success) {
        setSuccess('Profile updated successfully');
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Submit password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const success = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (success) {
        setSuccess('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      setError('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Your Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: 40,
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>

            <Typography variant="h5" gutterBottom>
              {user?.name || 'User'}
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              {user?.email || 'user@example.com'}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="subtitle1" gutterBottom>
                Learning Level
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {preferences.level.charAt(0).toUpperCase() + preferences.level.slice(1)}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                Member Since
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'Unknown'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Main content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab icon={<PersonIcon />} label="Profile" />
              <Tab icon={<LockIcon />} label="Security" />
              <Tab icon={<SettingsIcon />} label="Preferences" />
            </Tabs>

            {/* Profile Tab */}
            <TabPanel value={activeTab} index={0}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <Box component="form" onSubmit={handleProfileSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      required
                      disabled // Email changes might require verification
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      multiline
                      rows={4}
                      placeholder="Tell us a bit about yourself and your learning goals..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      disabled={loading || authLoading}
                    >
                      {loading || authLoading ? (
                        <CircularProgress size={24} />
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            {/* Security Tab */}
            <TabPanel value={activeTab} index={1}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <Box component="form" onSubmit={handlePasswordSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<LockIcon />}
                      disabled={loading || authLoading}
                    >
                      {loading || authLoading ? (
                        <CircularProgress size={24} />
                      ) : (
                        'Change Password'
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            {/* Preferences Tab */}
            <TabPanel value={activeTab} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Learning Preferences
                      </Typography>

                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="level-label">Learning Level</InputLabel>
                        <Select
                          labelId="level-label"
                          name="level"
                          value={preferences.level}
                          onChange={handlePreferenceChange}
                          label="Learning Level"
                        >
                          <MenuItem value="beginner">Beginner</MenuItem>
                          <MenuItem value="intermediate">Intermediate</MenuItem>
                          <MenuItem value="advanced">Advanced</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.saveHistory}
                            onChange={handlePreferenceChange}
                            name="saveHistory"
                          />
                        }
                        label="Save learning history"
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Notification Settings
                      </Typography>

                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.emailNotifications}
                            onChange={handlePreferenceChange}
                            name="emailNotifications"
                          />
                        }
                        label="Email notifications"
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Display Settings
                      </Typography>

                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.darkMode}
                            onChange={handlePreferenceChange}
                            name="darkMode"
                          />
                        }
                        label="Dark mode"
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleProfileSubmit}
                    disabled={loading || authLoading}
                  >
                    {loading || authLoading ? (
                      <CircularProgress size={24} />
                    ) : (
                      'Save Preferences'
                    )}
                  </Button>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
