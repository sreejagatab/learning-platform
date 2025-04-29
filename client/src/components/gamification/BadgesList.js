import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import GamificationContext from '../../context/GamificationContext';
import AchievementCard from './AchievementCard';

const BadgesList = ({ showUnearned = true, maxDisplay = null }) => {
  const {
    fetchBadges,
    badges,
    getUserBadges,
    loading
  } = useContext(GamificationContext);

  const [selectedBadge, setSelectedBadge] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const handleBadgeClick = (badge, isEarned, earnedDate) => {
    setSelectedBadge({ ...badge, isEarned, earnedDate });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!badges || badges.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
        No badges available yet.
      </Typography>
    );
  }

  const userBadges = getUserBadges();
  const userBadgeIds = userBadges.map(badge => badge.badge._id || badge.badge);

  // Filter badges based on whether they're earned and the showUnearned prop
  const filteredBadges = badges.filter(badge => {
    const isEarned = userBadgeIds.includes(badge._id);
    return isEarned || showUnearned;
  });

  // Sort badges: earned first, then by level
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    const aEarned = userBadgeIds.includes(a._id);
    const bEarned = userBadgeIds.includes(b._id);

    // First sort by earned status
    if (aEarned && !bEarned) return -1;
    if (!aEarned && bEarned) return 1;

    // Then sort by level
    return a.level - b.level;
  });

  // Limit the number of badges displayed if maxDisplay is set
  const displayBadges = maxDisplay ? sortedBadges.slice(0, maxDisplay) : sortedBadges;

  return (
    <>
      <Grid container spacing={2}>
        {displayBadges.map((badge) => {
          const isEarned = userBadgeIds.includes(badge._id);
          const earnedBadge = userBadges.find(b => (b.badge._id || b.badge) === badge._id);
          const earnedDate = earnedBadge ? earnedBadge.earnedAt : null;

          return (
            <Grid item xs={6} sm={4} md={3} key={badge._id}>
              <AchievementCard
                badge={badge}
                earned={isEarned}
                earnedDate={earnedDate}
                onClick={() => handleBadgeClick(badge, isEarned, earnedDate)}
              />
            </Grid>
          );
        })}
      </Grid>

      {/* Badge Detail Dialog */}
      {selectedBadge && (
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedBadge.name}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: selectedBadge.isEarned ? 'primary.main' : 'grey.300',
                  color: selectedBadge.isEarned ? 'primary.contrastText' : 'text.secondary',
                  mb: 2
                }}
              >
                <Typography variant="h2" component="span">
                  {selectedBadge.icon}
                </Typography>
              </Box>

              <Typography variant="body1" paragraph>
                {selectedBadge.description}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Category: {selectedBadge.category.charAt(0).toUpperCase() + selectedBadge.category.slice(1)}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Level: {selectedBadge.level}
              </Typography>

              {selectedBadge.isEarned && (
                <Typography variant="subtitle1" color="success.main" sx={{ mt: 2 }}>
                  Earned on {new Date(selectedBadge.earnedDate).toLocaleDateString()}
                </Typography>
              )}

              {!selectedBadge.isEarned && (
                <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2 }}>
                  Not yet earned
                </Typography>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                {selectedBadge.criteria && `Requirement: ${selectedBadge.criteria.threshold} ${selectedBadge.criteria.type}`}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default BadgesList;
