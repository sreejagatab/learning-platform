import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { LearningProvider } from '../context/LearningContext';
import { GamificationProvider } from '../context/GamificationContext';
import { AnalyticsProvider } from '../context/AnalyticsContext';
import App from '../App';
import Learn from '../pages/Learn';
import Dashboard from '../pages/Dashboard';

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
    updateProfile: jest.fn()
  },
  learningAPI: {
    askQuestion: jest.fn(),
    askFollowUpQuestion: jest.fn(),
    generateLearningPath: jest.fn(),
    getHistory: jest.fn(),
    saveContent: jest.fn(),
    getSavedContent: jest.fn(),
    getContentById: jest.fn(),
    deleteContent: jest.fn()
  },
  gamificationAPI: {
    getGamificationData: jest.fn(),
    updateDailyGoal: jest.fn(),
    recordActivity: jest.fn(),
    getBadges: jest.fn(),
    getUserBadges: jest.fn()
  },
  analyticsAPI: {
    trackActivity: jest.fn(),
    getLearningProgress: jest.fn(),
    getUserInsights: jest.fn(),
    getRecommendations: jest.fn()
  }
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock context values
const mockAuthContext = {
  user: {
    _id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    preferences: {
      level: 'intermediate',
      topicsOfInterest: ['JavaScript', 'React']
    }
  },
  isAuthenticated: true,
  loading: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  updateProfile: jest.fn()
};

// Helper function to render with all providers
const renderWithProviders = (ui, contextValues = {}) => {
  const allContextValues = {
    auth: { ...mockAuthContext, ...contextValues.auth }
  };
  
  return render(
    <BrowserRouter>
      <AuthProvider value={allContextValues.auth}>
        <LearningProvider>
          <GamificationProvider>
            <AnalyticsProvider>
              {ui}
            </AnalyticsProvider>
          </GamificationProvider>
        </LearningProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Complex Client Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Network Resilience', () => {
    test('should retry failed API calls', async () => {
      // Mock API to fail once then succeed
      const { learningAPI } = require('../services/api');
      let callCount = 0;
      
      learningAPI.askQuestion.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          content: 'JavaScript is a programming language...',
          citations: [],
          followUpQuestions: []
        });
      });
      
      renderWithProviders(<Learn />);
      
      // Type a question
      const queryInput = screen.getByPlaceholderText(/ask a question/i);
      fireEvent.change(queryInput, { target: { value: 'What is JavaScript?' } });
      
      // Submit the question
      const submitButton = screen.getByRole('button', { name: /ask/i });
      fireEvent.click(submitButton);
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
      
      // Retry the question
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      
      // Should show loading state
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
      
      // Should eventually show the response
      await waitFor(() => {
        expect(screen.getByText(/JavaScript is a programming language/i)).toBeInTheDocument();
      });
      
      // Should have called the API twice
      expect(learningAPI.askQuestion).toHaveBeenCalledTimes(2);
    });
    
    test('should handle offline mode and sync when back online', async () => {
      // Mock navigator.onLine
      const originalOnLine = window.navigator.onLine;
      Object.defineProperty(window.navigator, 'onLine', { value: false, writable: true });
      
      // Mock localStorage for offline storage
      const offlineActions = [];
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = jest.fn((key, value) => {
        if (key === 'offlineActions') {
          offlineActions.push(JSON.parse(value));
        }
        originalSetItem(key, value);
      });
      
      renderWithProviders(<Learn />);
      
      // Type a question
      const queryInput = screen.getByPlaceholderText(/ask a question/i);
      fireEvent.change(queryInput, { target: { value: 'What is JavaScript?' } });
      
      // Submit the question
      const submitButton = screen.getByRole('button', { name: /ask/i });
      fireEvent.click(submitButton);
      
      // Should show offline message
      await waitFor(() => {
        expect(screen.getByText(/you are offline/i)).toBeInTheDocument();
      });
      
      // Check if action was stored for later sync
      expect(localStorageMock.setItem).toHaveBeenCalledWith('offlineActions', expect.any(String));
      
      // Simulate coming back online
      Object.defineProperty(window.navigator, 'onLine', { value: true });
      
      // Trigger online event
      window.dispatchEvent(new Event('online'));
      
      // Mock API to succeed now
      const { learningAPI } = require('../services/api');
      learningAPI.askQuestion.mockResolvedValue({
        content: 'JavaScript is a programming language...',
        citations: [],
        followUpQuestions: []
      });
      
      // Should sync offline actions
      await waitFor(() => {
        expect(learningAPI.askQuestion).toHaveBeenCalled();
      });
      
      // Restore original properties
      Object.defineProperty(window.navigator, 'onLine', { value: originalOnLine });
      localStorageMock.setItem = originalSetItem;
    });
  });
  
  describe('State Management', () => {
    test('should preserve state across navigation', async () => {
      // Mock APIs
      const { learningAPI, authAPI } = require('../services/api');
      
      authAPI.getProfile.mockResolvedValue(mockAuthContext.user);
      
      learningAPI.askQuestion.mockResolvedValue({
        content: 'JavaScript is a programming language...',
        citations: [],
        followUpQuestions: []
      });
      
      learningAPI.getHistory.mockResolvedValue([]);
      
      // Set token in localStorage
      localStorageMock.setItem('token', 'mock-token');
      
      // Render the app
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );
      
      // Wait for app to load
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
      
      // Navigate to learn page
      fireEvent.click(screen.getByText(/learn/i));
      
      // Wait for learn page to load
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument();
      });
      
      // Type a question
      const queryInput = screen.getByPlaceholderText(/ask a question/i);
      fireEvent.change(queryInput, { target: { value: 'What is JavaScript?' } });
      
      // Submit the question
      const submitButton = screen.getByRole('button', { name: /ask/i });
      fireEvent.click(submitButton);
      
      // Wait for response
      await waitFor(() => {
        expect(screen.getByText(/JavaScript is a programming language/i)).toBeInTheDocument();
      });
      
      // Navigate to dashboard
      fireEvent.click(screen.getByText(/dashboard/i));
      
      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText(/recent activity/i)).toBeInTheDocument();
      });
      
      // Navigate back to learn page
      fireEvent.click(screen.getByText(/learn/i));
      
      // Wait for learn page to load and check if state was preserved
      await waitFor(() => {
        expect(screen.getByText(/JavaScript is a programming language/i)).toBeInTheDocument();
      });
    });
    
    test('should handle complex state transitions', async () => {
      // Mock APIs
      const { learningAPI } = require('../services/api');
      
      // Mock a sequence of responses
      const responses = [
        {
          content: 'JavaScript is a programming language...',
          citations: [],
          followUpQuestions: ['What are JavaScript frameworks?', 'How is JavaScript different from Java?']
        },
        {
          content: 'Popular JavaScript frameworks include React, Vue, and Angular...',
          citations: [],
          followUpQuestions: ['What is React?', 'What is Vue?']
        },
        {
          content: 'React is a JavaScript library for building user interfaces...',
          citations: [],
          followUpQuestions: ['What are React hooks?', 'What is JSX?']
        }
      ];
      
      let responseIndex = 0;
      
      learningAPI.askQuestion.mockImplementation(() => {
        return Promise.resolve(responses[responseIndex++]);
      });
      
      learningAPI.askFollowUpQuestion.mockImplementation(() => {
        return Promise.resolve(responses[responseIndex++]);
      });
      
      renderWithProviders(<Learn />);
      
      // Type a question
      const queryInput = screen.getByPlaceholderText(/ask a question/i);
      fireEvent.change(queryInput, { target: { value: 'What is JavaScript?' } });
      
      // Submit the question
      const submitButton = screen.getByRole('button', { name: /ask/i });
      fireEvent.click(submitButton);
      
      // Wait for first response
      await waitFor(() => {
        expect(screen.getByText(/JavaScript is a programming language/i)).toBeInTheDocument();
      });
      
      // Click on a follow-up question
      fireEvent.click(screen.getByText(/What are JavaScript frameworks/i));
      
      // Wait for second response
      await waitFor(() => {
        expect(screen.getByText(/Popular JavaScript frameworks include React, Vue, and Angular/i)).toBeInTheDocument();
      });
      
      // Click on another follow-up question
      fireEvent.click(screen.getByText(/What is React/i));
      
      // Wait for third response
      await waitFor(() => {
        expect(screen.getByText(/React is a JavaScript library for building user interfaces/i)).toBeInTheDocument();
      });
      
      // Check if conversation history is maintained
      expect(screen.getByText(/What is JavaScript/i)).toBeInTheDocument();
      expect(screen.getByText(/What are JavaScript frameworks/i)).toBeInTheDocument();
      expect(screen.getByText(/What is React/i)).toBeInTheDocument();
    });
  });
  
  describe('Performance Optimization', () => {
    test('should debounce rapid user input', async () => {
      // Mock API
      const { learningAPI } = require('../services/api');
      
      renderWithProviders(<Learn />);
      
      // Type a question character by character rapidly
      const queryInput = screen.getByPlaceholderText(/ask a question/i);
      
      // Simulate typing "What is JavaScript?" character by character
      const question = 'What is JavaScript?';
      for (let i = 0; i < question.length; i++) {
        fireEvent.change(queryInput, { target: { value: question.substring(0, i + 1) } });
      }
      
      // Submit the question
      const submitButton = screen.getByRole('button', { name: /ask/i });
      fireEvent.click(submitButton);
      
      // API should only be called once despite multiple input changes
      await waitFor(() => {
        expect(learningAPI.askQuestion).toHaveBeenCalledTimes(1);
      });
    });
    
    test('should lazy load components', async () => {
      // Mock APIs
      const { authAPI } = require('../services/api');
      
      authAPI.getProfile.mockResolvedValue(mockAuthContext.user);
      
      // Set token in localStorage
      localStorageMock.setItem('token', 'mock-token');
      
      // Spy on React.lazy
      const originalLazy = React.lazy;
      const lazySpy = jest.fn(originalLazy);
      React.lazy = lazySpy;
      
      // Render the app
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );
      
      // Wait for app to load
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
      
      // Navigate to different pages to trigger lazy loading
      fireEvent.click(screen.getByText(/learn/i));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText(/my content/i));
      
      await waitFor(() => {
        expect(screen.getByText(/my content/i)).toBeInTheDocument();
      });
      
      // Lazy should have been called for each route component
      expect(lazySpy).toHaveBeenCalled();
      
      // Restore original React.lazy
      React.lazy = originalLazy;
    });
  });
  
  describe('Accessibility', () => {
    test('should navigate using keyboard only', async () => {
      // Mock APIs
      const { authAPI } = require('../services/api');
      
      authAPI.getProfile.mockResolvedValue(mockAuthContext.user);
      
      // Set token in localStorage
      localStorageMock.setItem('token', 'mock-token');
      
      // Render the app
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );
      
      // Wait for app to load
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
      
      // Navigate to learn page using keyboard
      const learnLink = screen.getByText(/learn/i);
      learnLink.focus();
      fireEvent.keyDown(learnLink, { key: 'Enter', code: 'Enter' });
      
      // Wait for learn page to load
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument();
      });
      
      // Focus on the question input
      const queryInput = screen.getByPlaceholderText(/ask a question/i);
      queryInput.focus();
      
      // Type a question
      fireEvent.change(queryInput, { target: { value: 'What is JavaScript?' } });
      
      // Tab to the submit button
      fireEvent.keyDown(queryInput, { key: 'Tab', code: 'Tab' });
      
      // Press Enter to submit
      const submitButton = screen.getByRole('button', { name: /ask/i });
      expect(document.activeElement).toBe(submitButton);
      fireEvent.keyDown(submitButton, { key: 'Enter', code: 'Enter' });
      
      // Mock API response
      const { learningAPI } = require('../services/api');
      learningAPI.askQuestion.mockResolvedValue({
        content: 'JavaScript is a programming language...',
        citations: [],
        followUpQuestions: []
      });
      
      // Wait for response
      await waitFor(() => {
        expect(learningAPI.askQuestion).toHaveBeenCalled();
      });
    });
  });
  
  describe('Error Boundaries', () => {
    test('should catch and display component errors', async () => {
      // Create a component that will throw an error
      const BuggyComponent = () => {
        throw new Error('Test error');
      };
      
      // Mock console.error to prevent test output noise
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      // Render the buggy component within the app's error boundary
      render(
        <BrowserRouter>
          <AuthProvider value={mockAuthContext}>
            <LearningProvider>
              <GamificationProvider>
                <AnalyticsProvider>
                  <BuggyComponent />
                </AnalyticsProvider>
              </GamificationProvider>
            </LearningProvider>
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Should display the error message
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      
      // Restore console.error
      console.error = originalConsoleError;
    });
  });
});
