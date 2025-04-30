import React, { useContext } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Divider, 
  Switch, 
  FormControlLabel, 
  Button, 
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  Refresh as ResetIcon,
  Save as SaveIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import UserPreferencesContext from '../context/UserPreferencesContext';
import KnowledgeLevelSelector from '../components/KnowledgeLevelSelector';

/**
 * User Preferences Page
 * 
 * Allows users to customize their learning experience
 */
const UserPreferences = () => {
  const navigate = useNavigate();
  const { preferences, updatePreference, setKnowledgeLevel, toggleTheme, resetPreferences } = useContext(UserPreferencesContext);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Handle knowledge level change
  const handleKnowledgeLevelChange = (level) => {
    setKnowledgeLevel(level);
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    toggleTheme();
  };

  // Handle content density change
  const handleContentDensityChange = (event) => {
    updatePreference('contentDensity', event.target.value);
  };

  // Handle code snippet theme change
  const handleCodeSnippetThemeChange = (event) => {
    updatePreference('codeSnippetTheme', event.target.value);
  };

  // Handle toggle switches
  const handleToggleChange = (preference) => (event) => {
    updatePreference(preference, event.target.checked);
  };

  // Handle reset preferences
  const handleResetPreferences = () => {
    resetPreferences();
    setShowSaveSuccess(true);
  };

  // Handle save preferences
  const handleSavePreferences = () => {
    // Preferences are automatically saved via the context
    setShowSaveSuccess(true);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setShowSaveSuccess(false);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SettingsIcon fontSize="large" sx={{ mr: 2 }} />
          <Typography variant="h4" component="h1">
            User Preferences
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Customize your learning experience by setting your preferences. These settings will be used to personalize content and recommendations.
        </Alert>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Learning Preferences
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ mb: 4 }}>
            <KnowledgeLevelSelector 
              value={preferences.knowledgeLevel} 
              onChange={handleKnowledgeLevelChange}
              showDescription={true}
            />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="content-density-label">Content Density</InputLabel>
                <Select
                  labelId="content-density-label"
                  id="content-density"
                  value={preferences.contentDensity}
                  label="Content Density"
                  onChange={handleContentDensityChange}
                >
                  <MenuItem value="compact">Compact</MenuItem>
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="detailed">Detailed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="code-snippet-theme-label">Code Snippet Theme</InputLabel>
                <Select
                  labelId="code-snippet-theme-label"
                  id="code-snippet-theme"
                  value={preferences.codeSnippetTheme}
                  label="Code Snippet Theme"
                  onChange={handleCodeSnippetThemeChange}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="github">GitHub</MenuItem>
                  <MenuItem value="monokai">Monokai</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Display Preferences
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.theme === 'dark'}
                    onChange={handleThemeToggle}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {preferences.theme === 'dark' ? <DarkModeIcon sx={{ mr: 1 }} /> : <LightModeIcon sx={{ mr: 1 }} />}
                    <Typography>Dark Mode</Typography>
                  </Box>
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.showCitations}
                    onChange={handleToggleChange('showCitations')}
                    color="primary"
                  />
                }
                label="Show Citations"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.showRelatedTopics}
                    onChange={handleToggleChange('showRelatedTopics')}
                    color="primary"
                  />
                }
                label="Show Related Topics"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.autoSaveNotes}
                    onChange={handleToggleChange('autoSaveNotes')}
                    color="primary"
                  />
                }
                label="Auto-save Notes"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.notificationsEnabled}
                    onChange={handleToggleChange('notificationsEnabled')}
                    color="primary"
                  />
                }
                label="Enable Notifications"
              />
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            startIcon={<ResetIcon />}
            onClick={handleResetPreferences}
          >
            Reset to Defaults
          </Button>
          <Box>
            <Button 
              variant="outlined" 
              sx={{ mr: 2 }}
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              startIcon={<SaveIcon />}
              onClick={handleSavePreferences}
            >
              Save Preferences
            </Button>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={showSaveSuccess}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message="Preferences saved successfully"
      />
    </Container>
  );
};

export default UserPreferences;
