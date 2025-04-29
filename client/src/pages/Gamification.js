import React, { useContext, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { useState } from 'react';
import GamificationContext from '../context/GamificationContext';
import {
  GamificationSummary,
  BadgesList,
  Leaderboard
} from '../components/gamification';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`gamification-tabpanel-${index}`}
      aria-labelledby={`gamification-tab-${index}`}
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

const Gamification = () => {
  const {
    fetchGamificationData,
    fetchBadges,
    fetchLeaderboard,
    loading,
    error,
    recordActivity
  } = useContext(GamificationContext);

  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Fetch all gamification data
    fetchGamificationData();
    fetchBadges();
    fetchLeaderboard();

    // Record activity for gamification page visit
    recordActivity('gamification_visit', 0, { source: 'gamification_page' });
  }, [fetchGamificationData, fetchBadges, fetchLeaderboard, recordActivity]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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
          Gamification
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
        Your Learning Journey
      </Typography>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Progress" />
          <Tab label="Achievements" />
          <Tab label="Leaderboard" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <GamificationSummary />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" gutterBottom>
            Your Achievements
          </Typography>
          <Typography variant="body1" paragraph>
            Earn badges by completing learning activities, maintaining streaks, and creating content.
          </Typography>
          <BadgesList showUnearned={true} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h5" gutterBottom>
            Learning Leaderboard
          </Typography>
          <Typography variant="body1" paragraph>
            See how you compare with other learners on the platform.
          </Typography>
          <Leaderboard />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Gamification;
