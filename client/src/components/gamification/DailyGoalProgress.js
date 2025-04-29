import React, { useContext, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import GamificationContext from '../../context/GamificationContext';

const DailyGoalProgress = ({ showSettings = true, size = 'medium' }) => {
  const { getDailyGoalProgress, updateDailyGoal, loading } = useContext(GamificationContext);
  const [openSettings, setOpenSettings] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  const { current, target, percentage } = getDailyGoalProgress();
  
  // Size variants
  const sizeMap = {
    small: 60,
    medium: 80,
    large: 120
  };
  
  const circleSize = sizeMap[size] || sizeMap.medium;
  const fontSize = size === 'small' ? '0.75rem' : size === 'large' ? '1.25rem' : '1rem';
  const labelSize = size === 'small' ? '0.7rem' : size === 'large' ? '0.9rem' : '0.8rem';
  
  const handleOpenSettings = () => {
    setNewGoal(target.toString());
    setOpenSettings(true);
  };
  
  const handleCloseSettings = () => {
    setOpenSettings(false);
  };
  
  const handleSaveSettings = async () => {
    const goalValue = parseInt(newGoal, 10);
    if (isNaN(goalValue) || goalValue < 1) {
      return;
    }
    
    setSettingsLoading(true);
    await updateDailyGoal(goalValue);
    setSettingsLoading(false);
    handleCloseSettings();
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: circleSize }}>
        <CircularProgress size={24} />
      </Box>
    );
  }
  
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={percentage}
          size={circleSize}
          thickness={4}
          sx={{
            color: percentage >= 100 ? 'success.main' : 'primary.main',
            circle: {
              strokeLinecap: 'round',
            }
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <Typography variant="body1" component="div" color="text.primary" sx={{ fontWeight: 'bold', fontSize }}>
            {percentage}%
          </Typography>
          <Typography variant="caption" component="div" color="text.secondary" sx={{ fontSize: labelSize }}>
            {current}/{target} min
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: labelSize }}>
          Daily Goal
        </Typography>
        
        {showSettings && (
          <Tooltip title="Set daily goal">
            <IconButton 
              size="small" 
              onClick={handleOpenSettings}
              sx={{ ml: 0.5, p: 0.5 }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      {/* Settings Dialog */}
      <Dialog open={openSettings} onClose={handleCloseSettings}>
        <DialogTitle>Set Daily Learning Goal</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Set your daily learning goal in minutes. This helps you maintain a consistent learning habit.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Daily Goal (minutes)"
            type="number"
            fullWidth
            variant="outlined"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            inputProps={{ min: 1, max: 240 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings}>Cancel</Button>
          <Button 
            onClick={handleSaveSettings} 
            variant="contained" 
            disabled={settingsLoading}
          >
            {settingsLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DailyGoalProgress;
