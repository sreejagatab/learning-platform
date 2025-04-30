import React, { useContext, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  LinearProgress,
  Tooltip,
  Icon
} from '@mui/material';
import { styled } from '@mui/material/styles';
import GamificationContext from '../../context/GamificationContext';
import PointsBadge from './PointsBadge';
import LevelBadge from './LevelBadge';
import StreakCounter from './StreakCounter';
import DailyGoalProgress from './DailyGoalProgress';
import BadgesList from './BadgesList';

// Styled components
const StatsCard = styled(Card)(({ theme, color = 'primary' }) => ({
  height: '100%',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
  borderTop: `4px solid ${theme.palette[color].main}`,
}));

const StatValue = styled(Typography)(({ theme, color = 'primary' }) => ({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: theme.palette[color].main,
  marginBottom: theme.spacing(1),
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

const GamificationSummary = () => {
  const { gamificationData, loading } = useContext(GamificationContext);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!gamificationData) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
        Gamification data not available.
      </Typography>
    );
  }

  // Calculate level progress percentage
  const levelProgress = Math.min(
    ((gamificationData.points - gamificationData.currentLevelThreshold) /
    (gamificationData.nextLevelThreshold - gamificationData.currentLevelThreshold)) * 100,
    100
  );

  // Format learning time
  const formatLearningTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Your Learning Journey
        </Typography>

        <Button
          variant="outlined"
          color="primary"
          size="small"
        >
          View All Achievements
        </Button>
      </Box>

      {/* Main Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="primary">
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ mb: 2 }}>
                <PointsBadge size="large" />
              </Box>
              <StatValue color="primary">
                {gamificationData.points}
              </StatValue>
              <StatLabel>
                Total Points
              </StatLabel>
              <Tooltip title={`${Math.round(gamificationData.nextLevelThreshold - gamificationData.points)} points to next level`}>
                <LinearProgress
                  variant="determinate"
                  value={levelProgress}
                  sx={{ mt: 2, height: 8, borderRadius: 4 }}
                />
              </Tooltip>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="secondary">
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ mb: 2 }}>
                <LevelBadge showProgress={false} size="large" />
              </Box>
              <StatValue color="secondary">
                {gamificationData.level}
              </StatValue>
              <StatLabel>
                Current Level
              </StatLabel>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Tooltip title="Keep earning points to level up!">
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                  >
                    Level Benefits
                  </Button>
                </Tooltip>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="success">
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ mb: 2 }}>
                <StreakCounter size="large" />
              </Box>
              <StatValue color="success">
                {gamificationData.streak.current}
              </StatValue>
              <StatLabel>
                Day Streak
              </StatLabel>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Best Streak: {gamificationData.streak.longest} days
                </Typography>
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="warning">
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ mb: 2 }}>
                <DailyGoalProgress size="large" />
              </Box>
              <StatValue color="warning">
                {gamificationData.dailyGoal.current}/{gamificationData.dailyGoal.target}
              </StatValue>
              <StatLabel>
                Daily Goal
              </StatLabel>
              <LinearProgress
                variant="determinate"
                value={(gamificationData.dailyGoal.current / gamificationData.dailyGoal.target) * 100}
                color="warning"
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Tabs for different stats sections */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          aria-label="gamification stats tabs"
        >
          <Tab label="Learning Stats" />
          <Tab label="Achievements" />
          <Tab label="Rewards" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box sx={{ mb: 3, minHeight: 300 }}>
        {/* Learning Stats Panel */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Icon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }}>school</Icon>
                  <StatValue>{gamificationData.stats.sessionsCompleted}</StatValue>
                  <StatLabel>Learning Sessions</StatLabel>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Icon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }}>help</Icon>
                  <StatValue color="secondary">{gamificationData.stats.questionsAsked}</StatValue>
                  <StatLabel>Questions Asked</StatLabel>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Icon sx={{ fontSize: 40, color: 'success.main', mb: 1 }}>edit_note</Icon>
                  <StatValue color="success">{gamificationData.stats.contentCreated}</StatValue>
                  <StatLabel>Content Created</StatLabel>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Icon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }}>timer</Icon>
                  <StatValue color="warning">
                    {Math.round(gamificationData.stats.totalLearningTime / 60)}
                  </StatValue>
                  <StatLabel>Hours Learning</StatLabel>
                  <Typography variant="caption" color="text.secondary">
                    {formatLearningTime(gamificationData.stats.totalLearningTime)}
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Icon sx={{ fontSize: 40, color: 'info.main', mb: 1 }}>explore</Icon>
                  <StatValue color="info">
                    {gamificationData.stats.topicsExplored || 0}
                  </StatValue>
                  <StatLabel>Topics Explored</StatLabel>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Icon sx={{ fontSize: 40, color: 'error.main', mb: 1 }}>emoji_events</Icon>
                  <StatValue color="error">
                    {gamificationData.badges.length}
                  </StatValue>
                  <StatLabel>Badges Earned</StatLabel>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Icon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }}>calendar_today</Icon>
                  <StatValue>
                    {gamificationData.stats.daysActive || 0}
                  </StatValue>
                  <StatLabel>Days Active</StatLabel>
                </CardContent>
              </StatsCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Icon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }}>trending_up</Icon>
                  <StatValue color="secondary">
                    {gamificationData.stats.completionRate || 0}%
                  </StatValue>
                  <StatLabel>Completion Rate</StatLabel>
                </CardContent>
              </StatsCard>
            </Grid>
          </Grid>
        )}

        {/* Achievements Panel */}
        {tabValue === 1 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Your Achievements
            </Typography>

            {gamificationData.badges && gamificationData.badges.length > 0 ? (
              <BadgesList showUnearned={false} maxDisplay={8} />
            ) : (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Icon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }}>emoji_events</Icon>
                <Typography variant="body1" color="text.secondary">
                  You haven&apos;t earned any badges yet. Keep learning to unlock achievements!
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  View Available Badges
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Rewards Panel */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Available Rewards
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <StatsCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Premium Content Access
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Unlock premium learning content by reaching level 5.
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((gamificationData.level / 5) * 100, 100)}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="outlined"
                      fullWidth
                      disabled={gamificationData.level < 5}
                    >
                      {gamificationData.level >= 5 ? 'Claim Reward' : `Level ${gamificationData.level}/5`}
                    </Button>
                  </CardContent>
                </StatsCard>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <StatsCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Custom Profile Badge
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Earn a custom profile badge by maintaining a 7-day streak.
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((gamificationData.streak.current / 7) * 100, 100)}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="outlined"
                      fullWidth
                      disabled={gamificationData.streak.current < 7}
                    >
                      {gamificationData.streak.current >= 7 ? 'Claim Reward' : `${gamificationData.streak.current}/7 Days`}
                    </Button>
                  </CardContent>
                </StatsCard>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <StatsCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Certificate of Achievement
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Earn a certificate by completing 50 learning sessions.
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((gamificationData.stats.sessionsCompleted / 50) * 100, 100)}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="outlined"
                      fullWidth
                      disabled={gamificationData.stats.sessionsCompleted < 50}
                    >
                      {gamificationData.stats.sessionsCompleted >= 50 ? 'Claim Reward' : `${gamificationData.stats.sessionsCompleted}/50 Sessions`}
                    </Button>
                  </CardContent>
                </StatsCard>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default GamificationSummary;
