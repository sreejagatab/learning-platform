import React from 'react';
import { Box, Typography, Paper, Alert, AlertTitle, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import { AdminPanelSettings as AdminIcon, Person as UserIcon, Login as LoginIcon } from '@mui/icons-material';

/**
 * Component to display demo credentials in development mode
 * @param {Object} props - Component props
 * @param {Function} props.onSelectCredentials - Callback when credentials are selected
 */
const DemoCredentials = ({ onSelectCredentials }) => {
  return (
    <Paper elevation={0} sx={{ mb: 3, p: 2, bgcolor: 'background.default' }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        <AlertTitle>Demo Accounts Available</AlertTitle>
        Use these credentials to explore the application in development mode
      </Alert>

      <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
        <ListItem
          secondaryAction={
            onSelectCredentials && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<LoginIcon />}
                onClick={() => onSelectCredentials({
                  email: 'admin@learnsphere.dev',
                  password: 'admin123'
                })}
              >
                Use Admin
              </Button>
            )
          }
        >
          <AdminIcon color="primary" sx={{ mr: 2 }} />
          <ListItemText
            primary="Admin Account"
            secondary={
              <Box>
                <Typography variant="body2" component="span">Email: </Typography>
                <Typography variant="body2" component="span" sx={{ fontWeight: 'bold' }}>
                  admin@learnsphere.dev
                </Typography>
                <br />
                <Typography variant="body2" component="span">Password: </Typography>
                <Typography variant="body2" component="span" sx={{ fontWeight: 'bold' }}>
                  admin123
                </Typography>
              </Box>
            }
          />
        </ListItem>

        <Divider variant="inset" component="li" />

        <ListItem
          secondaryAction={
            onSelectCredentials && (
              <Button
                variant="outlined"
                size="small"
                color="secondary"
                startIcon={<LoginIcon />}
                onClick={() => onSelectCredentials({
                  email: 'user@learnsphere.dev',
                  password: 'demo123'
                })}
              >
                Use User
              </Button>
            )
          }
        >
          <UserIcon color="secondary" sx={{ mr: 2 }} />
          <ListItemText
            primary="Regular User Account"
            secondary={
              <Box>
                <Typography variant="body2" component="span">Email: </Typography>
                <Typography variant="body2" component="span" sx={{ fontWeight: 'bold' }}>
                  user@learnsphere.dev
                </Typography>
                <br />
                <Typography variant="body2" component="span">Password: </Typography>
                <Typography variant="body2" component="span" sx={{ fontWeight: 'bold' }}>
                  demo123
                </Typography>
              </Box>
            }
          />
        </ListItem>
      </List>
    </Paper>
  );
};

export default DemoCredentials;
