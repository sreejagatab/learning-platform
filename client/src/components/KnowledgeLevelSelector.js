import React from 'react';
import { 
  Box, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Tooltip, 
  Typography,
  Paper
} from '@mui/material';
import { 
  EmojiPeople as BeginnerIcon,
  School as IntermediateIcon,
  Psychology as AdvancedIcon,
  WorkspacePremium as ExpertIcon
} from '@mui/icons-material';

/**
 * Knowledge Level Selector Component
 * 
 * Allows users to select their knowledge level for personalized content
 * 
 * @param {Object} props - Component props
 * @param {String} props.value - Current selected level
 * @param {Function} props.onChange - Change handler function
 * @param {Boolean} props.showDescription - Whether to show detailed descriptions
 * @param {String} props.variant - Display variant ('standard', 'compact', or 'icons')
 * @param {Object} props.sx - Additional MUI styling
 */
const KnowledgeLevelSelector = ({ 
  value = 'intermediate', 
  onChange,
  showDescription = true,
  variant = 'standard',
  sx = {}
}) => {
  // Knowledge level descriptions and icons
  const levels = {
    beginner: {
      label: 'Beginner',
      description: 'New to the subject with little or no prior knowledge',
      icon: <BeginnerIcon color="primary" />,
      tooltip: 'Simple explanations with everyday examples'
    },
    intermediate: {
      label: 'Intermediate',
      description: 'Familiar with basic concepts but seeking deeper understanding',
      icon: <IntermediateIcon color="primary" />,
      tooltip: 'Balanced depth with connections to existing knowledge'
    },
    advanced: {
      label: 'Advanced',
      description: 'Strong understanding seeking detailed and technical knowledge',
      icon: <AdvancedIcon color="primary" />,
      tooltip: 'Sophisticated explanations with technical terminology'
    },
    expert: {
      label: 'Expert',
      description: 'Deep expertise seeking cutting-edge and specialized information',
      icon: <ExpertIcon color="primary" />,
      tooltip: 'Highly technical with references to recent research'
    }
  };

  // Handle change event
  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  // Render compact variant (just icons and tooltips)
  if (variant === 'icons') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', ...sx }}>
        <RadioGroup
          row
          value={value}
          onChange={handleChange}
        >
          {Object.entries(levels).map(([key, level]) => (
            <Tooltip key={key} title={`${level.label}: ${level.tooltip}`}>
              <FormControlLabel
                value={key}
                control={<Radio icon={level.icon} checkedIcon={level.icon} />}
                label=""
                sx={{ mx: 1 }}
              />
            </Tooltip>
          ))}
        </RadioGroup>
      </Box>
    );
  }

  // Render compact variant (minimal text)
  if (variant === 'compact') {
    return (
      <FormControl component="fieldset" sx={sx}>
        <FormLabel component="legend">Knowledge Level</FormLabel>
        <RadioGroup
          row
          value={value}
          onChange={handleChange}
        >
          {Object.entries(levels).map(([key, level]) => (
            <Tooltip key={key} title={level.tooltip}>
              <FormControlLabel
                value={key}
                control={<Radio size="small" />}
                label={level.label}
              />
            </Tooltip>
          ))}
        </RadioGroup>
      </FormControl>
    );
  }

  // Render standard variant (full descriptions)
  return (
    <FormControl component="fieldset" fullWidth sx={sx}>
      <FormLabel component="legend">Select Your Knowledge Level</FormLabel>
      <RadioGroup
        value={value}
        onChange={handleChange}
      >
        {Object.entries(levels).map(([key, level]) => (
          <Paper 
            key={key}
            elevation={value === key ? 3 : 1}
            sx={{ 
              mb: 1, 
              p: 1, 
              borderRadius: 1,
              borderLeft: value === key ? '4px solid' : 'none',
              borderColor: 'primary.main',
              bgcolor: value === key ? 'primary.light' : 'background.paper',
              color: value === key ? 'primary.contrastText' : 'text.primary',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: value === key ? 'primary.light' : 'action.hover',
              }
            }}
          >
            <FormControlLabel
              value={key}
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {level.icon}
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="subtitle1" component="div">
                      {level.label}
                    </Typography>
                    {showDescription && (
                      <Typography variant="body2" color={value === key ? 'inherit' : 'text.secondary'}>
                        {level.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              }
              sx={{ width: '100%', m: 0 }}
            />
          </Paper>
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default KnowledgeLevelSelector;
