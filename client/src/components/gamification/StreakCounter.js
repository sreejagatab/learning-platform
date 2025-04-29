import React, { useContext } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { LocalFireDepartment as FireIcon } from '@mui/icons-material';
import GamificationContext from '../../context/GamificationContext';

const StreakCounter = ({ showIcon = true, size = 'medium' }) => {
  const { getCurrentStreak, loading } = useContext(GamificationContext);
  
  const streak = getCurrentStreak();
  
  // Size variants
  const sizeStyles = {
    small: {
      container: { px: 1, py: 0.5 },
      icon: { fontSize: 16 },
      text: { fontSize: '0.75rem' }
    },
    medium: {
      container: { px: 1.5, py: 0.75 },
      icon: { fontSize: 20 },
      text: { fontSize: '0.875rem' }
    },
    large: {
      container: { px: 2, py: 1 },
      icon: { fontSize: 24 },
      text: { fontSize: '1rem' }
    }
  };
  
  const styles = sizeStyles[size] || sizeStyles.medium;
  
  if (loading) {
    return null;
  }
  
  // Determine color based on streak length
  let color = 'primary';
  if (streak >= 30) {
    color = 'error'; // Red for 30+ days
  } else if (streak >= 14) {
    color = 'warning'; // Orange for 14+ days
  } else if (streak >= 7) {
    color = 'success'; // Green for 7+ days
  }
  
  return (
    <Tooltip title={`${streak} day learning streak`}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: `${color}.main`,
          color: `${color}.contrastText`,
          borderRadius: 2,
          ...styles.container
        }}
      >
        {showIcon && (
          <FireIcon sx={{ mr: 0.5, ...styles.icon }} />
        )}
        <Typography variant="body2" sx={styles.text}>
          {streak} day{streak !== 1 ? 's' : ''}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default StreakCounter;
