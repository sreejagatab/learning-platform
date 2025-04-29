import React, { useState } from 'react';
import { learningAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Tabs,
  Tab,
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Preview as PreviewIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import RichTextEditor from './RichTextEditor';
import ContentPreview from './ContentPreview';
import './ContentCreationForm.css';

// TabPanel component for the editor/preview tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`editor-tabpanel-${index}`}
      aria-labelledby={`editor-tab-${index}`}
      className="editor-tab-panel"
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

const ContentCreationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'note',
    metadata: {
      tags: [],
      level: 'beginner',
      topic: '',
      description: ''
    }
  });
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0); // 0 for editor, 1 for preview

  // Handle tab change between editor and preview
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle rich text editor content changes
  const handleEditorChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  // Handle tags input changes
  const handleTagsChange = (e) => {
    setTags(e.target.value);
    // Update the metadata.tags array
    const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: tagsArray
      }
    }));
  };

  // Handle metadata field changes
  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [name]: value
      }
    }));
  };

  // Handle tag deletion (for chip-based tag UI)
  const handleTagDelete = (tagToDelete) => {
    const newTags = formData.metadata.tags.filter(tag => tag !== tagToDelete);
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: newTags
      }
    }));

    // Update the tags input field
    setTags(newTags.join(', '));
  };

  // Add a new tag from the input field
  const handleAddTag = () => {
    if (!tags.trim()) return;

    const newTag = tags.trim();
    if (!formData.metadata.tags.includes(newTag)) {
      const updatedTags = [...formData.metadata.tags, newTag];
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          tags: updatedTags
        }
      }));
    }

    // Clear the tag input
    setTags('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validate form data
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.content.trim()) {
        throw new Error('Content is required');
      }

      // Submit the form data
      const response = await learningAPI.createContent(formData);

      console.log('Content creation response:', response);

      setSuccess('Content created successfully!');

      // Reset form after successful submission
      setFormData({
        title: '',
        content: '',
        type: 'note',
        metadata: {
          tags: [],
          level: 'beginner'
        }
      });
      setTags('');

      // Get the content ID from the response
      // The API now returns either response.data._id or response.data.data._id
      const contentId = response.data._id ||
                        (response.data.data && response.data.data._id);

      if (!contentId) {
        console.error('No content ID found in response:', response);
        throw new Error('Content was created but ID was not returned properly');
      }

      // Redirect to the content view page after a short delay
      setTimeout(() => {
        navigate(`/content/${contentId}`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create content. Please try again.');
      console.error('Error creating content:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper className="content-creation-form" elevation={2}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2">Create New Content</Typography>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          variant="outlined"
        >
          Back
        </Button>
      </Box>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Title"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a title for your content"
            required
            fullWidth
            variant="outlined"
            margin="normal"
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              select
              label="Content Type"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="note">Note</MenuItem>
              <MenuItem value="article">Article</MenuItem>
              <MenuItem value="learning_path">Learning Path</MenuItem>
              <MenuItem value="summary">Summary</MenuItem>
              <MenuItem value="quiz">Quiz</MenuItem>
              <MenuItem value="flashcards">Flashcards</MenuItem>
            </TextField>

            <TextField
              select
              label="Difficulty Level"
              id="level"
              name="level"
              value={formData.metadata.level}
              onChange={handleMetadataChange}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="intermediate">Intermediate</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
            </TextField>
          </Box>

          <TextField
            label="Topic"
            id="topic"
            name="topic"
            value={formData.metadata.topic || ''}
            onChange={handleMetadataChange}
            placeholder="Main topic (e.g., JavaScript, Machine Learning)"
            fullWidth
            variant="outlined"
            margin="normal"
          />

          <TextField
            label="Description"
            id="description"
            name="description"
            value={formData.metadata.description || ''}
            onChange={handleMetadataChange}
            placeholder="Brief description of this content"
            fullWidth
            variant="outlined"
            margin="normal"
            multiline
            rows={2}
          />

          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle1" component="label" htmlFor="tags">
              Tags
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {formData.metadata.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleTagDelete(tag)}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                id="tags"
                value={tags}
                onChange={handleTagsChange}
                placeholder="Add a tag"
                variant="outlined"
                size="small"
                fullWidth
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddTag}
                disabled={!tags.trim()}
              >
                Add
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Editor/Preview Tabs */}
        <Box sx={{ width: '100%', mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="editor tabs"
              className="editor-tabs"
            >
              <Tab
                icon={<EditIcon />}
                label="Editor"
                id="editor-tab-0"
                aria-controls="editor-tabpanel-0"
              />
              <Tab
                icon={<PreviewIcon />}
                label="Preview"
                id="editor-tab-1"
                aria-controls="editor-tabpanel-1"
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <RichTextEditor
              value={formData.content}
              onChange={handleEditorChange}
              placeholder="Enter your content here..."
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <ContentPreview
              content={formData.content}
              title={formData.title}
              type={formData.type}
              metadata={formData.metadata}
            />
          </TabPanel>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={<SaveIcon />}
          >
            {isSubmitting ? 'Creating...' : 'Create Content'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ContentCreationForm;
