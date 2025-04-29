import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuizComponent from '../components/QuizComponent';
import { AnalyticsProvider } from '../context/AnalyticsContext';

// Mock the analytics context
jest.mock('../context/AnalyticsContext', () => ({
  ...jest.requireActual('../context/AnalyticsContext'),
  useAnalytics: () => ({
    trackFeatureUse: jest.fn()
  })
}));

// Mock function for onInsert prop
const mockInsert = jest.fn();

// Helper function to render with required context
const renderQuizComponent = () => {
  return render(
    <AnalyticsProvider>
      <QuizComponent onInsert={mockInsert} />
    </AnalyticsProvider>
  );
};

describe('QuizComponent', () => {
  beforeEach(() => {
    mockInsert.mockClear();
  });

  test('renders quiz button', () => {
    renderQuizComponent();
    const quizButton = screen.getByText('Quiz');
    expect(quizButton).toBeInTheDocument();
  });

  test('opens dialog when button is clicked', () => {
    renderQuizComponent();
    const quizButton = screen.getByText('Quiz');
    fireEvent.click(quizButton);
    
    // Check if dialog is open
    const dialogTitle = screen.getByText('Create Quiz');
    expect(dialogTitle).toBeInTheDocument();
  });

  test('adds a new question when Add Question button is clicked', async () => {
    renderQuizComponent();
    const quizButton = screen.getByText('Quiz');
    fireEvent.click(quizButton);
    
    // Initially there should be one question
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    
    // Click Add Question button
    const addQuestionButton = screen.getByText('Add Question');
    fireEvent.click(addQuestionButton);
    
    // Now there should be two questions
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
  });

  test('toggles question type when toggle button is clicked', () => {
    renderQuizComponent();
    const quizButton = screen.getByText('Quiz');
    fireEvent.click(quizButton);
    
    // Initially it should be Single Choice
    const toggleButton = screen.getByText('Single Choice');
    expect(toggleButton).toBeInTheDocument();
    
    // Click toggle button
    fireEvent.click(toggleButton);
    
    // Now it should be Multiple Choice
    expect(screen.getByText('Multiple Choice')).toBeInTheDocument();
  });

  test('adds an option when Add Option button is clicked', () => {
    renderQuizComponent();
    const quizButton = screen.getByText('Quiz');
    fireEvent.click(quizButton);
    
    // Get the number of option inputs initially
    const initialOptionInputs = screen.getAllByPlaceholderText('Enter option');
    const initialCount = initialOptionInputs.length;
    
    // Click Add Option button
    const addOptionButton = screen.getByText('Add Option');
    fireEvent.click(addOptionButton);
    
    // Now there should be one more option input
    const updatedOptionInputs = screen.getAllByPlaceholderText('Enter option');
    expect(updatedOptionInputs.length).toBe(initialCount + 1);
  });

  test('creates and inserts a quiz when form is filled and Insert Quiz button is clicked', async () => {
    renderQuizComponent();
    const quizButton = screen.getByText('Quiz');
    fireEvent.click(quizButton);
    
    // Fill in quiz title
    const titleInput = screen.getByLabelText('Quiz Title');
    fireEvent.change(titleInput, { target: { value: 'Test Quiz' } });
    
    // Fill in question text
    const questionInput = screen.getByLabelText('Question Text');
    fireEvent.change(questionInput, { target: { value: 'What is the capital of France?' } });
    
    // Fill in options
    const optionInputs = screen.getAllByPlaceholderText('Enter option');
    fireEvent.change(optionInputs[0], { target: { value: 'Paris' } });
    fireEvent.change(optionInputs[1], { target: { value: 'London' } });
    
    // Set correct answer
    const correctAnswerRadios = screen.getAllByRole('radio');
    fireEvent.click(correctAnswerRadios[0]); // Select first option as correct
    
    // Click Insert Quiz button
    const insertButton = screen.getByText('Insert Quiz');
    fireEvent.click(insertButton);
    
    // Check if onInsert was called with HTML containing the quiz data
    expect(mockInsert).toHaveBeenCalled();
    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg).toContain('embedded-quiz');
    expect(insertArg).toContain('Test Quiz');
    expect(insertArg).toContain('data-quiz');
  });

  test('previews quiz correctly when Preview button is clicked', async () => {
    renderQuizComponent();
    const quizButton = screen.getByText('Quiz');
    fireEvent.click(quizButton);
    
    // Fill in quiz title
    const titleInput = screen.getByLabelText('Quiz Title');
    fireEvent.change(titleInput, { target: { value: 'Test Quiz' } });
    
    // Fill in question text
    const questionInput = screen.getByLabelText('Question Text');
    fireEvent.change(questionInput, { target: { value: 'What is the capital of France?' } });
    
    // Fill in options
    const optionInputs = screen.getAllByPlaceholderText('Enter option');
    fireEvent.change(optionInputs[0], { target: { value: 'Paris' } });
    fireEvent.change(optionInputs[1], { target: { value: 'London' } });
    
    // Click Preview button
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);
    
    // Check if preview mode is active
    expect(screen.getByText('Quiz Preview')).toBeInTheDocument();
    expect(screen.getByText('Test Quiz')).toBeInTheDocument();
    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
  });

  test('validates form before submission', () => {
    renderQuizComponent();
    const quizButton = screen.getByText('Quiz');
    fireEvent.click(quizButton);
    
    // Don't fill in any fields
    
    // Insert and Preview buttons should be disabled
    const insertButton = screen.getByText('Insert Quiz');
    const previewButton = screen.getByText('Preview');
    expect(insertButton).toBeDisabled();
    expect(previewButton).toBeDisabled();
    
    // Fill in quiz title only
    const titleInput = screen.getByLabelText('Quiz Title');
    fireEvent.change(titleInput, { target: { value: 'Test Quiz' } });
    
    // Buttons should still be disabled
    expect(insertButton).toBeDisabled();
    expect(previewButton).toBeDisabled();
    
    // Fill in question text
    const questionInput = screen.getByLabelText('Question Text');
    fireEvent.change(questionInput, { target: { value: 'What is the capital of France?' } });
    
    // Now buttons should be enabled
    expect(insertButton).not.toBeDisabled();
    expect(previewButton).not.toBeDisabled();
  });
});
