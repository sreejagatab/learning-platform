import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tooltip,
  Zoom,
  Icon,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components
const StyledCard = styled(Card)(({ theme, level, earned }) => ({
  position: 'relative',
  borderRadius: theme.spacing(2),
  transition: 'transform 0.3s, box-shadow 0.3s',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  backgroundColor: earned ? theme.palette.background.paper : theme.palette.grey[100],
  opacity: earned ? 1 : 0.7,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
  border: earned ? `2px solid ${getLevelColor(level, theme)}` : 'none',
}));

const BadgeIcon = styled(Box)(({ theme, level, earned }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 auto',
  marginTop: theme.spacing(2),
  backgroundColor: earned ? getLevelColor(level, theme) : theme.palette.grey[300],
  color: earned ? theme.palette.getContrastText(getLevelColor(level, theme)) : theme.palette.grey[500],
  boxShadow: earned ? theme.shadows[4] : 'none',
}));

const LevelChip = styled(Chip)(({ theme, level }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: getLevelColor(level, theme),
  color: theme.palette.getContrastText(getLevelColor(level, theme)),
  fontWeight: 'bold',
}));

// Helper function to get color based on badge level
function getLevelColor(level, theme) {
  switch (level) {
    case 1:
      return theme.palette.success.main; // Green for level 1
    case 2:
      return theme.palette.info.main; // Blue for level 2
    case 3:
      return theme.palette.warning.main; // Orange for level 3
    case 4:
      return theme.palette.error.main; // Red for level 4
    case 5:
      return theme.palette.secondary.main; // Purple for level 5
    default:
      return theme.palette.primary.main;
  }
}

const AchievementCard = ({ badge, earned = false, earnedDate = null, onClick }) => {
  return (
    <Tooltip
      title={
        earned
          ? `Earned on ${new Date(earnedDate).toLocaleDateString()}`
          : `Not yet earned: ${badge.description}`
      }
      arrow
      TransitionComponent={Zoom}
      placement="top"
    >
      <StyledCard level={badge.level} earned={earned} onClick={onClick}>
        <LevelChip
          label={`Level ${badge.level}`}
          size="small"
          level={badge.level}
        />
        
        <BadgeIcon level={badge.level} earned={earned}>
          <Icon sx={{ fontSize: 40 }}>{badge.icon}</Icon>
        </BadgeIcon>
        
        <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {badge.name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            {badge.description}
          </Typography>
          
          {earned && (
            <Box mt={2}>
              <Chip
                label="Earned"
                color="success"
                size="small"
                variant="outlined"
              />
            </Box>
          )}
        </CardContent>
      </StyledCard>
    </Tooltip>
  );
};

export default AchievementCard;
