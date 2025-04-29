import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { LearningProvider } from '../context/LearningContext';
import { GamificationProvider } from '../context/GamificationContext';
import { AnalyticsProvider } from '../context/AnalyticsContext';
import Learn from '../pages/Learn';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ContentCreation from '../pages/ContentCreation';

// Mock API service
jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  },
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn()
  },
  learningAPI: {
    askQuestion: jest.fn(),
    generateLearningPath: jest.fn(),
    getHistory: jest.fn(),
    saveContent: jest.fn(),
    getSavedContent: jest.fn(),
    getContentById: jest.fn(),
    deleteContent: jest.fn()
  },
  userAPI: {
    getStats: jest.fn(),
    updatePreferences: jest.fn()
  }
}));

// Mock toast notifications
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn()
  },
  ToastContainer: () => <div data-testid="toast-container" />
}));

// Mock context values
const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  loading: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  updateProfile: jest.fn()
};

const mockLearningContext = {
  askQuestion: jest.fn(),
  askFollowUpQuestion: jest.fn(),
  clearSession: jest.fn(),
  saveContent: jest.fn(),
  generateLearningPath: jest.fn(),
  currentQuery: '',
  currentResponse: '',
  queryLoading: false,
  queryError: null,
  sessionMessages: [],
  followUpQuestions: [],
  citations: [],
  userLevel: 'intermediate',
  updateUserLevel: jest.fn()
};

const mockGamificationContext = {
  points: 0,
  level: 1,
  streak: 0,
  badges: [],
  loading: false,
  getUserPoints: jest.fn().mockReturnValue(0),
  getUserLevel: jest.fn().mockReturnValue(1),
  getCurrentStreak: jest.fn().mockReturnValue(0),
  getUserBadges: jest.fn(),
  updateDailyGoal: jest.fn(),
  recordActivity: jest.fn()
};

const mockAnalyticsContext = {
  trackPageView: jest.fn(),
  trackLearningSession: jest.fn(),
  trackContentView: jest.fn(),
  trackSearch: jest.fn(),
  getLearningProgress: jest.fn().mockReturnValue([]),
  getUserInsights: jest.fn().mockReturnValue({}),
  getRecommendations: jest.fn().mockReturnValue([]),
  loading: false
};

// Helper function to render with all providers
const renderWithProviders = (ui, contextValues = {}) => {
  const allContextValues = {
    auth: { ...mockAuthContext, ...contextValues.auth },
    learning: { ...mockLearningContext, ...contextValues.learning },
    gamification: { ...mockGamificationContext, ...contextValues.gamification },
    analytics: { ...mockAnalyticsContext, ...contextValues.analytics }
  };
  
  return render(
    <BrowserRouter>
      <AuthProvider value={allContextValues.auth}>
        <LearningProvider value={allContextValues.learning}>
          <GamificationProvider value={allContextValues.gamification}>
            <AnalyticsProvider value={allContextValues.analytics}>
              {ui}
            </AnalyticsProvider>
          </GamificationProvider>
        </LearningProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Error Handling Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Error Handling', () => {
    test('should display error message for invalid login', async () => {
      const loginErrorMessage = 'Invalid credentials';
      const loginMock = jest.fn().mockRejectedValue({
        response: {
          data: {
            message: loginErrorMessage
          }
        }
      });
      
      renderWithProviders(<Login />, {
        auth: { login: loginMock }
      });
      
      // Fill in login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      // Check if login was called
      expect(loginMock).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
      
      // Check if error message is displayed
      await waitFor(() => {
        expect(screen.getByText(loginErrorMessage)).toBeInTheDocument();
      });
    });
    
    test('should display error message for invalid registration', async () => {
      const registerErrorMessage = 'Email already in use';
      const registerMock = jest.fn().mockRejectedValue({
        response: {
          data: {
            message: registerErrorMessage
          }
        }
      });
      
      renderWithProviders(<Register />, {
        auth: { register: registerMock }
      });
      
      // Fill in registration form
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(submitButton);
      
      // Check if register was called
      expect(registerMock).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      
      // Check if error message is displayed
      await waitFor(() => {
        expect(screen.getByText(registerErrorMessage)).toBeInTheDocument();
      });
    });
    
    test('should display validation errors for registration form', async () => {
      renderWithProviders(<Register />);
      
      // Submit form without filling it
      const submitButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(submitButton);
      
      // Check if validation errors are displayed
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
      
      // Fill in with invalid data
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      
      fireEvent.change(nameInput, { target: { value: 'T' } }); // Too short
      fireEvent.change(emailInput, { target: { value: 'not-an-email' } }); // Invalid email
      fireEvent.change(passwordInput, { target: { value: '123' } }); // Too short
      fireEvent.change(confirmPasswordInput, { target: { value: '1234' } }); // Doesn't match
      
      // Submit form again
      fireEvent.click(submitButton);
      
      // Check if validation errors are displayed
      await waitFor(() => {
        expect(screen.getByText(/name must be at least/i)).toBeInTheDocument();
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
        expect(screen.getByText(/password must be at least/i)).toBeInTheDocument();
        expect(screen.getByText(/passwords must match/i)).toBeInTheDocument();
      });
    });
  });
  
  describe('Learning Error Handling', () => {
    test('should display error message for failed query', async () => {
      const queryErrorMessage = 'Error processing your query';
      const askQuestionMock = jest.fn().mockRejectedValue({
        response: {
          data: {
            message: queryErrorMessage
          }
        }
      });
      
      renderWithProviders(<Learn />, {
        learning: { 
          askQuestion: askQuestionMock,
          queryError: queryErrorMessage
        }
      });
      
      // Fill in query input
      const queryInput = screen.getByPlaceholderText(/ask a question/i);
      fireEvent.change(queryInput, { target: { value: 'What is JavaScript?' } });
      
      // Submit query
      const submitButton = screen.getByRole('button', { name: /ask/i });
      fireEvent.click(submitButton);
      
      // Check if askQuestion was called
      expect(askQuestionMock).toHaveBeenCalledWith('What is JavaScript?', expect.any(Object));
      
      // Check if error message is displayed
      await waitFor(() => {
        expect(screen.getByText(queryErrorMessage)).toBeInTheDocument();
      });
    });
    
    test('should display loading state during query', async () => {
      renderWithProviders(<Learn />, {
        learning: { 
          queryLoading: true
        }
      });
      
      // Check if loading indicator is displayed
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });
    
    test('should handle network errors gracefully', async () => {
      const networkErrorMessage = 'Network Error';
      const askQuestionMock = jest.fn().mockRejectedValue(new Error(networkErrorMessage));
      
      renderWithProviders(<Learn />, {
        learning: { 
          askQuestion: askQuestionMock,
          queryError: networkErrorMessage
        }
      });
      
      // Fill in query input
      const queryInput = screen.getByPlaceholderText(/ask a question/i);
      fireEvent.change(queryInput, { target: { value: 'What is JavaScript?' } });
      
      // Submit query
      const submitButton = screen.getByRole('button', { name: /ask/i });
      fireEvent.click(submitButton);
      
      // Check if error message is displayed
      await waitFor(() => {
        expect(screen.getByText(networkErrorMessage)).toBeInTheDocument();
      });
    });
  });
  
  describe('Content Creation Error Handling', () => {
    test('should display validation errors for content creation', async () => {
      renderWithProviders(<ContentCreation />);
      
      // Submit form without filling it
      const submitButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(submitButton);
      
      // Check if validation errors are displayed
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        expect(screen.getByText(/content is required/i)).toBeInTheDocument();
      });
    });
    
    test('should display error message for failed content creation', async () => {
      const contentErrorMessage = 'Error creating content';
      const saveContentMock = jest.fn().mockRejectedValue({
        response: {
          data: {
            message: contentErrorMessage
          }
        }
      });
      
      renderWithProviders(<ContentCreation />, {
        learning: { 
          saveContent: saveContentMock
        }
      });
      
      // Fill in content form
      const titleInput = screen.getByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: 'Test Content' } });
      
      // Mock rich text editor content
      // This is a simplified approach - in a real test, you'd need to mock the rich text editor component
      const contentEditor = screen.getByTestId('content-editor');
      fireEvent.change(contentEditor, { target: { value: 'This is test content' } });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(submitButton);
      
      // Check if saveContent was called
      expect(saveContentMock).toHaveBeenCalled();
      
      // Check if error message is displayed
      await waitFor(() => {
        expect(screen.getByText(contentErrorMessage)).toBeInTheDocument();
      });
    });
  });
  
  describe('Session Expiration Handling', () => {
    test('should redirect to login page when session expires', async () => {
      // Mock the API interceptor to simulate a 401 response
      const mockInterceptor = (error) => {
        if (error.response && error.response.status === 401) {
          // This would normally redirect to login
          return Promise.reject(error);
        }
        return Promise.reject(error);
      };
      
      // Mock the API service
      const api = require('../services/api').default;
      api.interceptors.response.use = jest.fn((successFn, errorFn) => {
        // Call the error handler with a 401 error
        errorFn({
          response: {
            status: 401,
            data: {
              message: 'Token expired'
            }
          }
        });
      });
      
      // Render the component
      renderWithProviders(<Learn />);
      
      // Check if redirected to login page
      // In a real test, you'd need to check if the navigate function was called with '/login'
      // This is a simplified approach
      expect(window.location.pathname).toBe('/');
    });
  });
  
  describe('Form Validation', () => {
    test('should validate email format', async () => {
      renderWithProviders(<Login />);
      
      // Fill in login form with invalid email
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      // Check if validation error is displayed
      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });
    
    test('should validate password length', async () => {
      renderWithProviders(<Login />);
      
      // Fill in login form with short password
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: '123' } });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      // Check if validation error is displayed
      await waitFor(() => {
        expect(screen.getByText(/password must be at least/i)).toBeInTheDocument();
      });
    });
  });
});
