import React, { useContext } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';
import GamificationContext from '../../context/GamificationContext';

const PointsBadge = ({ showIcon = true, size = 'medium' }) => {
  const { getUserPoints, loading } = useContext(GamificationContext);
  
  const points = getUserPoints();
  
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
  
  return (
    <Tooltip title="Your learning points">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: 2,
          ...styles.container
        }}
      >
        {showIcon && (
          <TrophyIcon sx={{ mr: 0.5, ...styles.icon }} />
        )}
        <Typography variant="body2" sx={styles.text}>
          {points.toLocaleString()} pts
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default PointsBadge;
