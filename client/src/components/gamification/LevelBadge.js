import React, { useContext } from 'react';
import { Box, Typography, Tooltip, LinearProgress } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import GamificationContext from '../../context/GamificationContext';

const LevelBadge = ({ showProgress = false, size = 'medium' }) => {
  const { gamificationData, loading } = useContext(GamificationContext);
  
  if (loading || !gamificationData) {
    return null;
  }
  
  const { level } = gamificationData;
  const currentLevel = level?.current || 1;
  const progress = level?.progress || 0;
  const nextLevelAt = level?.nextLevelAt || 100;
  const progressPercentage = Math.min(100, Math.round((progress / nextLevelAt) * 100));
  
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
  
  return (
    <Tooltip title={`Level ${currentLevel} • ${progress}/${nextLevelAt} XP to next level`}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'secondary.main',
            color: 'secondary.contrastText',
            borderRadius: 2,
            ...styles.container
          }}
        >
          <SchoolIcon sx={{ mr: 0.5, ...styles.icon }} />
          <Typography variant="body2" sx={styles.text}>
            Level {currentLevel}
          </Typography>
        </Box>
        
        {showProgress && (
          <Box sx={{ width: '100%', mt: 0.5 }}>
            <LinearProgress 
              variant="determinate" 
              value={progressPercentage} 
              color="secondary"
              sx={{ 
                height: 4, 
                borderRadius: 2,
                backgroundColor: 'rgba(156, 39, 176, 0.2)' // Light purple
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
              {progress}/{nextLevelAt} XP
            </Typography>
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};

export default LevelBadge;
