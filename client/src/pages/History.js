import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  InputAdornment,
  Button,
  Pagination,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  History as HistoryIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Psychology as PsychologyIcon,
  BookmarkAdd as BookmarkIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import LearningContext from '../context/LearningContext';

const History = () => {
  const { getLearningHistory, saveContent, historyLoading } = useContext(LearningContext);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedItem, setExpandedItem] = useState(null);

  const itemsPerPage = 10;

  // Load history data
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await getLearningHistory(page, itemsPerPage, searchQuery);
        setHistory(data.history || []);
        setTotalPages(data.pagination?.pages || 1);
      } catch (error) {
        console.error('Error fetching history:', error);
        toast.error('Failed to load learning history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [getLearningHistory, page, searchQuery]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };

  // Handle pagination
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  // Save content to notes
  const handleSaveToNotes = async (item) => {
    try {
      const title = item.query.length > 50
        ? `${item.query.substring(0, 50)}...`
        : item.query;

      const content = `# ${item.query}\n\n${item.response}\n\n## Follow-up Questions\n${
        item.followUps && item.followUps.length > 0
          ? item.followUps.map(fu => `- ${fu.query}\n  ${fu.response}`).join('\n\n')
          : 'No follow-up questions'
      }`;

      const metadata = {
        originalQuery: item.query,
        queryTimestamp: item.queryTimestamp,
        citations: item.citations || [],
      };

      await saveContent(title, content, 'note', metadata);
      toast.success('Saved to your notes');
    } catch (error) {
      console.error('Error saving to notes:', error);
      toast.error('Failed to save to notes');
    }
  };

  // Toggle expanded item
  const handleToggleExpand = (itemId) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Learning History
      </Typography>
      <Typography variant="body1" paragraph>
        Review your past learning sessions and questions
      </Typography>

      {/* Search and filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search your learning history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            Search
          </Button>
        </Box>
      </Paper>

      {/* History list */}
      {loading || historyLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : history.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <HistoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No learning history found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {searchQuery
              ? `No results found for "${searchQuery}"`
              : "You haven't asked any questions yet"}
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/learn"
            startIcon={<PsychologyIcon />}
          >
            Start Learning
          </Button>
        </Paper>
      ) : (
        <>
          <List component={Paper}>
            {history.map((item) => (
              <React.Fragment key={item._id}>
                <Accordion
                  expanded={expandedItem === item._id}
                  onChange={() => handleToggleExpand(item._id)}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <ListItem disablePadding>
                      <ListItemIcon>
                        <PsychologyIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.query}
                        secondary={formatDate(item.queryTimestamp)}
                      />
                    </ListItem>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ pl: 7, pr: 2 }}>
                      <Typography variant="body1" paragraph>
                        {item.response}
                      </Typography>

                      {/* Follow-up questions */}
                      {item.followUps && item.followUps.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Follow-up Questions:
                          </Typography>
                          <Grid container spacing={1}>
                            {item.followUps.map((followUp, index) => (
                              <Grid item xs={12} key={index}>
                                <Card variant="outlined">
                                  <CardContent>
                                    <Typography variant="subtitle2" gutterBottom>
                                      {followUp.query}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {followUp.response.length > 200
                                        ? `${followUp.response.substring(0, 200)}...`
                                        : followUp.response}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}

                      {/* Citations */}
                      {item.citations && item.citations.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Sources:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {item.citations.map((citation, index) => (
                              <Chip
                                key={index}
                                label={citation.title || 'Source'}
                                component="a"
                                href={citation.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                clickable
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Actions */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          startIcon={<BookmarkIcon />}
                          onClick={() => handleSaveToNotes(item)}
                          sx={{ mr: 1 }}
                        >
                          Save to Notes
                        </Button>
                        <Button
                          startIcon={<ArrowForwardIcon />}
                          component={RouterLink}
                          to={`/learn?q=${encodeURIComponent(item.query)}`}
                        >
                          Continue Learning
                        </Button>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
                <Divider />
              </React.Fragment>
            ))}
          </List>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default History;
