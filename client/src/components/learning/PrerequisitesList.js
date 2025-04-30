import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  Chip,
  Divider
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

/**
 * Component to display prerequisites for a learning path
 * 
 * @param {Object} props
 * @param {Array} props.prerequisites - Array of prerequisite objects
 * @param {Function} props.onLearnPrerequisite - Optional callback when Learn button is clicked
 * @param {Boolean} props.showTitle - Whether to show the Prerequisites title
 */
const PrerequisitesList = ({ prerequisites = [], onLearnPrerequisite, showTitle = true }) => {
  if (!prerequisites || prerequisites.length === 0) {
    return null;
  }

  // Get icon based on importance
  const getImportanceIcon = (importance) => {
    switch (importance) {
      case 'required':
        return <WarningIcon color="error" />;
      case 'recommended':
        return <InfoIcon color="primary" />;
      case 'optional':
        return <InfoIcon color="action" />;
      default:
        return <InfoIcon />;
    }
  };

  // Get color based on importance
  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'required':
        return 'error';
      case 'recommended':
        return 'primary';
      case 'optional':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      {showTitle && (
        <>
          <Typography variant="h6" gutterBottom>
            Prerequisites
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </>
      )}
      
      <List dense>
        {prerequisites.map((prereq, index) => (
          <ListItem 
            key={index}
            sx={{ 
              mb: 1, 
              p: 1.5,
              borderRadius: 1,
              bgcolor: prereq.importance === 'required' ? 'error.50' : 'transparent'
            }}
          >
            <ListItemIcon>
              {getImportanceIcon(prereq.importance)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {prereq.topic}
                  <Chip 
                    label={prereq.importance} 
                    size="small" 
                    color={getImportanceColor(prereq.importance)}
                    variant="outlined"
                  />
                </Box>
              }
              secondary={prereq.description}
            />
            {prereq.resourceUrl && (
              <Button
                size="small"
                variant="outlined"
                href={prereq.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (onLearnPrerequisite) {
                    e.preventDefault();
                    onLearnPrerequisite(prereq);
                  }
                }}
              >
                Learn
              </Button>
            )}
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default PrerequisitesList;
