import React, { useContext, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  School as SchoolIcon,
  LocalFireDepartment as FireIcon
} from '@mui/icons-material';
import GamificationContext from '../../context/GamificationContext';
import AuthContext from '../../context/AuthContext';

const Leaderboard = () => {
  const { fetchLeaderboard, leaderboard, loading } = useContext(GamificationContext);
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
        No leaderboard data available yet.
      </Typography>
    );
  }
  
  // Get medal color for top 3 positions
  const getMedalColor = (index) => {
    switch (index) {
      case 0:
        return '#FFD700'; // Gold
      case 1:
        return '#C0C0C0'; // Silver
      case 2:
        return '#CD7F32'; // Bronze
      default:
        return 'transparent';
    }
  };
  
  return (
    <Paper sx={{ width: '100%', mb: 2 }}>
      <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
        Leaderboard
      </Typography>
      
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {leaderboard.map((entry, index) => {
          const isCurrentUser = user && entry.user.id === user.id;
          
          return (
            <React.Fragment key={entry.user.id}>
              <ListItem 
                alignItems="center"
                sx={{ 
                  bgcolor: isCurrentUser ? 'action.selected' : 'inherit',
                  py: 1
                }}
              >
                <Box 
                  sx={{ 
                    minWidth: 30, 
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    mr: 1
                  }}
                >
                  {index < 3 ? (
                    <Avatar 
                      sx={{ 
                        width: 28, 
                        height: 28, 
                        bgcolor: getMedalColor(index),
                        color: index === 0 ? 'text.primary' : 'white',
                        fontWeight: 'bold',
                        fontSize: '0.875rem'
                      }}
                    >
                      {index + 1}
                    </Avatar>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {index + 1}
                    </Typography>
                  )}
                </Box>
                
                <ListItemAvatar>
                  <Avatar 
                    alt={entry.user.name} 
                    src={entry.user.avatar}
                    sx={{ 
                      border: isCurrentUser ? '2px solid' : 'none',
                      borderColor: 'primary.main'
                    }}
                  >
                    {entry.user.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body1"
                        component="span"
                        sx={{ 
                          fontWeight: isCurrentUser ? 'bold' : 'regular',
                          mr: 1
                        }}
                      >
                        {entry.user.name}
                      </Typography>
                      
                      {isCurrentUser && (
                        <Chip 
                          label="You" 
                          size="small" 
                          color="primary" 
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TrophyIcon color="primary" sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">
                          {entry.points.toLocaleString()} pts
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SchoolIcon color="secondary" sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">
                          Level {entry.level}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FireIcon color="error" sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">
                          {entry.streak} day streak
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <Chip 
                    label={`${entry.badges} badges`}
                    size="small"
                    color="default"
                    sx={{ height: 24 }}
                  />
                </Box>
              </ListItem>
              
              {index < leaderboard.length - 1 && (
                <Divider variant="inset" component="li" />
              )}
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
};

export default Leaderboard;
