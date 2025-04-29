import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton, Tooltip, Box } from '@mui/material';
import {
  Image as ImageIcon,
  Link as LinkIcon,
  Code as CodeIcon,
  YouTube as YouTubeIcon,
  Functions as MathIcon,
  Close as CloseIcon,
  QuestionAnswer as QuizIcon
} from '@mui/icons-material';
import './RichTextEditor.css';
import MathNotation from './MathNotation';
import CodeExecutionEnvironment from './CodeExecutionEnvironment';
import QuizComponent from './QuizComponent';

// Custom toolbar modules and formats
const modules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ]
  },
  clipboard: {
    matchVisual: false
  }
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'indent',
  'script',
  'color', 'background',
  'blockquote', 'code-block',
  'link', 'image', 'video'
];

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const [editorValue, setEditorValue] = useState(value || '');
  const [mediaDialog, setMediaDialog] = useState({ open: false, type: null });
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaAlt, setMediaAlt] = useState('');
  const [mediaWidth, setMediaWidth] = useState('100%');
  const [mediaHeight, setMediaHeight] = useState('auto');

  useEffect(() => {
    setEditorValue(value || '');
  }, [value]);

  const handleChange = (content) => {
    setEditorValue(content);
    if (onChange) {
      onChange(content);
    }
  };

  const handleMediaDialogOpen = (type) => {
    setMediaDialog({ open: true, type });
    setMediaUrl('');
    setMediaAlt('');
    setMediaWidth('100%');
    setMediaHeight('auto');
  };

  const handleMediaDialogClose = () => {
    setMediaDialog({ open: false, type: null });
  };

  const handleMediaInsert = () => {
    if (!mediaUrl.trim()) {
      return;
    }

    let insertHtml = '';

    switch (mediaDialog.type) {
      case 'image':
        insertHtml = `<img src="${mediaUrl}" alt="${mediaAlt}" style="max-width: ${mediaWidth}; height: ${mediaHeight};" />`;
        break;
      case 'video':
        // Extract YouTube video ID if it's a YouTube URL
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = mediaUrl.match(youtubeRegex);

        if (match && match[1]) {
          const videoId = match[1];
          insertHtml = `<iframe width="${mediaWidth}" height="${mediaHeight}" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        } else {
          insertHtml = `<video controls src="${mediaUrl}" style="max-width: ${mediaWidth}; height: ${mediaHeight};" />`;
        }
        break;
      case 'link':
        insertHtml = `<a href="${mediaUrl}" target="_blank" rel="noopener noreferrer">${mediaAlt || mediaUrl}</a>`;
        break;
      case 'code':
        insertHtml = `<pre><code>${mediaUrl}</code></pre>`;
        break;
      default:
        break;
    }

    // Get the Quill editor instance
    const editor = document.querySelector('.rich-text-editor .ql-editor');
    if (editor) {
      // Insert the HTML at the current cursor position
      const range = window.getSelection().getRangeAt(0);
      const node = document.createElement('div');
      node.innerHTML = insertHtml;
      range.insertNode(node.firstChild);

      // Update the editor value
      handleChange(editor.innerHTML);
    }

    handleMediaDialogClose();
  };

  // Handle math notation insertion
  const handleMathInsert = (mathHtml) => {
    // Get the Quill editor instance
    const editor = document.querySelector('.rich-text-editor .ql-editor');
    if (editor) {
      // Insert the HTML at the current cursor position
      const range = window.getSelection().getRangeAt(0);
      const node = document.createElement('div');
      node.innerHTML = mathHtml;
      range.insertNode(node.firstChild);

      // Update the editor value
      handleChange(editor.innerHTML);
    }
  };

  // Handle code execution environment insertion
  const handleCodeInsert = (codeHtml) => {
    // Get the Quill editor instance
    const editor = document.querySelector('.rich-text-editor .ql-editor');
    if (editor) {
      // Insert the HTML at the current cursor position
      const range = window.getSelection().getRangeAt(0);
      const node = document.createElement('div');
      node.innerHTML = codeHtml;
      range.insertNode(node.firstChild);

      // Update the editor value
      handleChange(editor.innerHTML);
    }
  };

  // Handle quiz insertion
  const handleQuizInsert = (quizHtml) => {
    // Get the Quill editor instance
    const editor = document.querySelector('.rich-text-editor .ql-editor');
    if (editor) {
      // Insert the HTML at the current cursor position
      const range = window.getSelection().getRangeAt(0);
      const node = document.createElement('div');
      node.innerHTML = quizHtml;
      range.insertNode(node.firstChild);

      // Update the editor value
      handleChange(editor.innerHTML);
    }
  };

  // Custom toolbar with additional media embed options
  const CustomToolbar = () => (
    <div className="media-embed-toolbar">
      <Tooltip title="Insert Image">
        <button className="media-embed-button" onClick={() => handleMediaDialogOpen('image')}>
          <ImageIcon fontSize="small" /> Image
        </button>
      </Tooltip>
      <Tooltip title="Insert Video">
        <button className="media-embed-button" onClick={() => handleMediaDialogOpen('video')}>
          <YouTubeIcon fontSize="small" /> Video
        </button>
      </Tooltip>
      <Tooltip title="Insert Link">
        <button className="media-embed-button" onClick={() => handleMediaDialogOpen('link')}>
          <LinkIcon fontSize="small" /> Link
        </button>
      </Tooltip>
      <Box sx={{ display: 'inline-block', mx: 0.5 }}>
        <CodeExecutionEnvironment onInsert={handleCodeInsert} />
      </Box>
      <Box sx={{ display: 'inline-block', mx: 0.5 }}>
        <MathNotation onInsert={handleMathInsert} />
      </Box>
      <Box sx={{ display: 'inline-block', mx: 0.5 }}>
        <QuizComponent onInsert={handleQuizInsert} />
      </Box>
    </div>
  );

  // Media embed dialog content based on type
  const renderMediaDialogContent = () => {
    const { type } = mediaDialog;

    switch (type) {
      case 'image':
        return (
          <div className="media-embed-form">
            <TextField
              label="Image URL"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              fullWidth
              required
              placeholder="https://example.com/image.jpg"
            />
            <TextField
              label="Alt Text"
              value={mediaAlt}
              onChange={(e) => setMediaAlt(e.target.value)}
              fullWidth
              placeholder="Image description"
            />
            <TextField
              label="Width"
              value={mediaWidth}
              onChange={(e) => setMediaWidth(e.target.value)}
              fullWidth
              placeholder="100%, 500px, etc."
            />
            <TextField
              label="Height"
              value={mediaHeight}
              onChange={(e) => setMediaHeight(e.target.value)}
              fullWidth
              placeholder="auto, 300px, etc."
            />
          </div>
        );
      case 'video':
        return (
          <div className="media-embed-form">
            <TextField
              label="Video URL"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              fullWidth
              required
              placeholder="https://youtube.com/watch?v=VIDEO_ID"
            />
            <TextField
              label="Width"
              value={mediaWidth}
              onChange={(e) => setMediaWidth(e.target.value)}
              fullWidth
              placeholder="100%, 560px, etc."
            />
            <TextField
              label="Height"
              value={mediaHeight}
              onChange={(e) => setMediaHeight(e.target.value)}
              fullWidth
              placeholder="315px, 400px, etc."
            />
          </div>
        );
      case 'link':
        return (
          <div className="media-embed-form">
            <TextField
              label="URL"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              fullWidth
              required
              placeholder="https://example.com"
            />
            <TextField
              label="Link Text"
              value={mediaAlt}
              onChange={(e) => setMediaAlt(e.target.value)}
              fullWidth
              placeholder="Click here"
            />
          </div>
        );
      case 'code':
        return (
          <div className="media-embed-form">
            <TextField
              label="Code"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              fullWidth
              required
              multiline
              rows={6}
              placeholder="Paste your code here"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rich-text-editor">
      <CustomToolbar />
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Write your content here..."}
      />

      {/* Media Embed Dialog */}
      <Dialog
        open={mediaDialog.open}
        onClose={handleMediaDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {mediaDialog.type === 'image' && 'Insert Image'}
          {mediaDialog.type === 'video' && 'Insert Video'}
          {mediaDialog.type === 'link' && 'Insert Link'}
          {mediaDialog.type === 'code' && 'Insert Code Block'}
          <IconButton
            aria-label="close"
            onClick={handleMediaDialogClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="media-embed-dialog">
          {renderMediaDialogContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMediaDialogClose}>Cancel</Button>
          <Button onClick={handleMediaInsert} variant="contained" color="primary">
            Insert
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RichTextEditor;
