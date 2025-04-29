import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  TextField,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  QuestionAnswer as QuizIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../context/AnalyticsContext';

/**
 * Quiz Component for embedding interactive quizzes in learning content
 */
const QuizComponent = ({ onInsert }) => {
  const [open, setOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([
    {
      text: '',
      type: 'multiple-choice',
      options: ['', ''],
      correctAnswers: [0],
      explanation: ''
    }
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState([]);
  const [previewResults, setPreviewResults] = useState(null);
  const { trackFeatureUse } = useAnalytics();

  const handleOpen = () => {
    setOpen(true);
    trackFeatureUse('quiz_creator_opened');
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setQuizTitle('');
    setQuestions([
      {
        text: '',
        type: 'multiple-choice',
        options: ['', ''],
        correctAnswers: [0],
        explanation: ''
      }
    ]);
    setCurrentStep(0);
    setPreviewMode(false);
    setPreviewAnswers([]);
    setPreviewResults(null);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];

    if (question.type === 'multiple-choice') {
      // For multiple-choice, only one correct answer
      question.correctAnswers = [optionIndex];
    } else {
      // For multiple-select, toggle the correct answer
      const correctAnswers = [...question.correctAnswers];
      const index = correctAnswers.indexOf(optionIndex);

      if (index === -1) {
        correctAnswers.push(optionIndex);
      } else {
        correctAnswers.splice(index, 1);
      }

      question.correctAnswers = correctAnswers;
    }

    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push('');
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];

    // Remove the option
    question.options.splice(optionIndex, 1);

    // Update correct answers
    question.correctAnswers = question.correctAnswers
      .filter(index => index !== optionIndex)
      .map(index => (index > optionIndex ? index - 1 : index));

    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        type: 'multiple-choice',
        options: ['', ''],
        correctAnswers: [0],
        explanation: ''
      }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const updatedQuestions = [...questions];
      updatedQuestions.splice(index, 1);
      setQuestions(updatedQuestions);
    }
  };

  const toggleQuestionType = (index) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[index];
    
    question.type = question.type === 'multiple-choice' ? 'multiple-select' : 'multiple-choice';
    
    // If switching to multiple-choice and multiple correct answers are selected,
    // just keep the first one
    if (question.type === 'multiple-choice' && question.correctAnswers.length > 1) {
      question.correctAnswers = [question.correctAnswers[0]];
    }
    
    setQuestions(updatedQuestions);
  };

  const handlePreview = () => {
    setPreviewMode(true);
    setPreviewAnswers(Array(questions.length).fill([]));
    setPreviewResults(null);
  };

  const handleExitPreview = () => {
    setPreviewMode(false);
    setPreviewAnswers([]);
    setPreviewResults(null);
  };

  const handlePreviewAnswerChange = (questionIndex, optionIndex) => {
    const updatedAnswers = [...previewAnswers];
    const question = questions[questionIndex];
    
    if (question.type === 'multiple-choice') {
      // For multiple-choice, only one answer can be selected
      updatedAnswers[questionIndex] = [optionIndex];
    } else {
      // For multiple-select, toggle the answer
      const currentAnswers = updatedAnswers[questionIndex] || [];
      const index = currentAnswers.indexOf(optionIndex);
      
      if (index === -1) {
        updatedAnswers[questionIndex] = [...currentAnswers, optionIndex];
      } else {
        updatedAnswers[questionIndex] = currentAnswers.filter(i => i !== optionIndex);
      }
    }
    
    setPreviewAnswers(updatedAnswers);
  };

  const handleSubmitPreview = () => {
    // Calculate results
    let correctCount = 0;
    const questionResults = questions.map((question, index) => {
      const userAnswers = previewAnswers[index] || [];
      const correctAnswers = question.correctAnswers;
      
      // Check if answers match
      let isCorrect = false;
      if (question.type === 'multiple-choice') {
        isCorrect = userAnswers[0] === correctAnswers[0];
      } else {
        // For multiple-select, all correct options must be selected and no incorrect ones
        isCorrect = 
          userAnswers.length === correctAnswers.length && 
          userAnswers.every(answer => correctAnswers.includes(answer));
      }
      
      if (isCorrect) {
        correctCount++;
      }
      
      return {
        isCorrect,
        userAnswers,
        correctAnswers
      };
    });
    
    setPreviewResults({
      score: correctCount,
      total: questions.length,
      percentage: Math.round((correctCount / questions.length) * 100),
      questionResults
    });
    
    trackFeatureUse('quiz_preview_submitted');
  };

  const handleInsert = () => {
    if (!quizTitle.trim() || questions.some(q => !q.text.trim())) {
      return;
    }
    
    // Create a JSON representation of the quiz
    const quizData = {
      title: quizTitle,
      questions: questions.map(q => ({
        text: q.text,
        type: q.type,
        options: q.options.filter(o => o.trim()),
        correctAnswers: q.correctAnswers,
        explanation: q.explanation
      }))
    };
    
    // Create HTML for the quiz
    const quizHtml = `
      <div class="embedded-quiz" data-quiz='${JSON.stringify(quizData)}'>
        <h3>${quizTitle}</h3>
        <p><strong>${questions.length} question${questions.length !== 1 ? 's' : ''}</strong></p>
        <button class="quiz-start-button">Start Quiz</button>
      </div>
    `;
    
    onInsert(quizHtml);
    handleClose();
    trackFeatureUse('quiz_inserted');
  };

  const renderQuestionForm = (question, index) => {
    return (
      <Box key={index} sx={{ mb: 4, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Question {index + 1}</Typography>
          <Box>
            <Tooltip title="Toggle question type">
              <Button 
                size="small" 
                onClick={() => toggleQuestionType(index)}
                sx={{ mr: 1 }}
              >
                {question.type === 'multiple-choice' ? 'Single Choice' : 'Multiple Choice'}
              </Button>
            </Tooltip>
            <Tooltip title="Remove question">
              <IconButton 
                size="small" 
                color="error" 
                onClick={() => removeQuestion(index)}
                disabled={questions.length <= 1}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <TextField
          label="Question Text"
          value={question.text}
          onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        
        <Typography variant="subtitle2" gutterBottom>
          Options:
        </Typography>
        
        {question.options.map((option, optionIndex) => (
          <Box key={optionIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Checkbox
              checked={question.correctAnswers.includes(optionIndex)}
              onChange={() => handleCorrectAnswerChange(index, optionIndex)}
              color="success"
            />
            <TextField
              value={option}
              onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
              fullWidth
              placeholder={`Option ${optionIndex + 1}`}
              size="small"
              sx={{ mr: 1 }}
            />
            <IconButton 
              size="small" 
              color="error" 
              onClick={() => removeOption(index, optionIndex)}
              disabled={question.options.length <= 2}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
        
        <Button 
          startIcon={<AddIcon />} 
          onClick={() => addOption(index)}
          size="small"
          sx={{ mt: 1, mb: 2 }}
        >
          Add Option
        </Button>
        
        <TextField
          label="Explanation (shown after answering)"
          value={question.explanation}
          onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
          fullWidth
          multiline
          rows={2}
        />
      </Box>
    );
  };

  const renderPreview = () => {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>{quizTitle}</Typography>
        
        {previewResults ? (
          <Box sx={{ mb: 3 }}>
            <Alert 
              severity={previewResults.percentage >= 70 ? "success" : "info"}
              sx={{ mb: 2 }}
            >
              You scored {previewResults.score} out of {previewResults.total} ({previewResults.percentage}%)
            </Alert>
            
            {questions.map((question, index) => {
              const result = previewResults.questionResults[index];
              return (
                <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {index + 1}. {question.text}
                  </Typography>
                  
                  <Box sx={{ ml: 2 }}>
                    {question.options.map((option, optionIndex) => {
                      const isSelected = result.userAnswers.includes(optionIndex);
                      const isCorrect = result.correctAnswers.includes(optionIndex);
                      
                      let color = 'text.primary';
                      if (isSelected && isCorrect) {
                        color = 'success.main';
                      } else if (isSelected && !isCorrect) {
                        color = 'error.main';
                      } else if (!isSelected && isCorrect) {
                        color = 'success.main';
                      }
                      
                      return (
                        <Box 
                          key={optionIndex} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color,
                            mb: 0.5
                          }}
                        >
                          {isSelected ? (
                            isCorrect ? <CheckIcon color="success" /> : <CloseIcon color="error" />
                          ) : (
                            isCorrect && <CheckIcon color="success" />
                          )}
                          <Typography sx={{ ml: 1 }}>
                            {option}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                  
                  {question.explanation && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Explanation:</strong> {question.explanation}
                      </Typography>
                    </Box>
                  )}
                </Box>
              );
            })}
            
            <Button 
              variant="outlined" 
              onClick={handleExitPreview}
              sx={{ mr: 1 }}
            >
              Edit Quiz
            </Button>
          </Box>
        ) : (
          <>
            {questions.map((question, questionIndex) => (
              <Box key={questionIndex} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {questionIndex + 1}. {question.text}
                </Typography>
                
                <FormControl component="fieldset" sx={{ ml: 2 }}>
                  {question.type === 'multiple-choice' ? (
                    <RadioGroup
                      value={previewAnswers[questionIndex]?.[0] ?? ''}
                      onChange={(e) => handlePreviewAnswerChange(questionIndex, parseInt(e.target.value))}
                    >
                      {question.options.map((option, optionIndex) => (
                        <FormControlLabel
                          key={optionIndex}
                          value={optionIndex}
                          control={<Radio />}
                          label={option}
                        />
                      ))}
                    </RadioGroup>
                  ) : (
                    <Box>
                      {question.options.map((option, optionIndex) => (
                        <FormControlLabel
                          key={optionIndex}
                          control={
                            <Checkbox
                              checked={previewAnswers[questionIndex]?.includes(optionIndex) || false}
                              onChange={() => handlePreviewAnswerChange(questionIndex, optionIndex)}
                            />
                          }
                          label={option}
                        />
                      ))}
                    </Box>
                  )}
                </FormControl>
              </Box>
            ))}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                onClick={handleExitPreview}
              >
                Back to Edit
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSubmitPreview}
              >
                Submit Answers
              </Button>
            </Box>
          </>
        )}
      </Box>
    );
  };

  return (
    <>
      <Tooltip title="Insert Quiz">
        <Button 
          variant="outlined" 
          startIcon={<QuizIcon />} 
          onClick={handleOpen}
          size="small"
        >
          Quiz
        </Button>
      </Tooltip>
      
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {previewMode ? 'Quiz Preview' : 'Create Quiz'}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {previewMode ? (
            renderPreview()
          ) : (
            <>
              <TextField
                label="Quiz Title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                fullWidth
                required
                sx={{ mb: 3, mt: 1 }}
              />
              
              {questions.map((question, index) => renderQuestionForm(question, index))}
              
              <Button 
                startIcon={<AddIcon />} 
                onClick={addQuestion}
                variant="outlined"
                sx={{ mb: 2 }}
              >
                Add Question
              </Button>
            </>
          )}
        </DialogContent>
        
        {!previewMode && !previewResults && (
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              onClick={handlePreview}
              color="secondary"
              disabled={!quizTitle.trim() || questions.some(q => !q.text.trim())}
            >
              Preview
            </Button>
            <Button 
              onClick={handleInsert}
              color="primary"
              variant="contained"
              disabled={!quizTitle.trim() || questions.some(q => !q.text.trim())}
            >
              Insert Quiz
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
};

export default QuizComponent;
