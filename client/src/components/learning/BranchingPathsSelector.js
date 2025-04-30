import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';

/**
 * Component to display and manage branching paths in a learning path
 * 
 * @param {Object} props
 * @param {Array} props.branches - Array of branch objects
 * @param {Function} props.onSelectBranch - Callback when a branch is selected
 * @param {Function} props.onCreateBranch - Callback when a new branch is created
 * @param {Boolean} props.canCreate - Whether the user can create new branches
 */
const BranchingPathsSelector = ({ 
  branches = [], 
  onSelectBranch, 
  onCreateBranch,
  canCreate = true
}) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchDescription, setNewBranchDescription] = useState('');

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setNewBranchName('');
    setNewBranchDescription('');
  };

  const handleCreateBranch = () => {
    if (newBranchName.trim() && onCreateBranch) {
      onCreateBranch({
        name: newBranchName.trim(),
        description: newBranchDescription.trim(),
        condition: 'manual'
      });
      handleCloseCreateDialog();
    }
  };

  // Get color based on branch condition
  const getBranchConditionColor = (condition) => {
    switch (condition) {
      case 'performance':
        return 'success';
      case 'interest':
        return 'primary';
      case 'time':
        return 'warning';
      case 'manual':
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          <AccountTreeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Branching Paths
        </Typography>
        
        {canCreate && (
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Create Branch
          </Button>
        )}
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {branches.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2, textAlign: 'center' }}>
          No branching paths available yet. Create a branch to explore specialized content.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {branches.map((branch, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined">
                <CardActionArea onClick={() => onSelectBranch && onSelectBranch(branch)}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {branch.name}
                    </Typography>
                    
                    <Chip 
                      label={branch.condition} 
                      size="small" 
                      color={getBranchConditionColor(branch.condition)}
                      sx={{ mb: 1 }}
                    />
                    
                    <Typography variant="body2" color="text.secondary">
                      {branch.description || `A specialized path focusing on ${branch.name}`}
                    </Typography>
                    
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {branch.steps?.length || 0} steps
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Create Branch Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCloseCreateDialog}>
        <DialogTitle>Create New Branch</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Create a specialized branch to explore a specific aspect of this topic in more depth.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Branch Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="description"
            label="Description (optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newBranchDescription}
            onChange={(e) => setNewBranchDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateBranch} 
            variant="contained"
            disabled={!newBranchName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default BranchingPathsSelector;
