import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { LearningProvider } from '../context/LearningContext';
import { GamificationProvider } from '../context/GamificationContext';
import { AnalyticsProvider } from '../context/AnalyticsContext';
import App from '../App';
import Learn from '../pages/Learn';
import Dashboard from '../pages/Dashboard';
import Gamification from '../pages/Gamification';
import Analytics from '../pages/Analytics';

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

const mockLearningContext = {
  askQuestion: jest.fn(),
  askFollowUpQuestion: jest.fn(),
  clearSession: jest.fn(),
  saveContent: jest.fn(),
  generateLearningPath: jest.fn(),
  currentQuery: 'What is JavaScript?',
  currentResponse: 'JavaScript is a programming language...',
  queryLoading: false,
  queryError: null,
  sessionMessages: [
    {
      role: 'user',
      content: 'What is JavaScript?'
    },
    {
      role: 'assistant',
      content: 'JavaScript is a programming language...'
    }
  ],
  followUpQuestions: [
    'What are JavaScript frameworks?',
    'How is JavaScript different from Java?'
  ],
  citations: [
    {
      id: 'citation-1',
      title: 'JavaScript Documentation',
      url: 'https://example.com/js-docs'
    }
  ],
  userLevel: 'intermediate',
  updateUserLevel: jest.fn()
};

const mockGamificationContext = {
  points: 100,
  level: 5,
  streak: 7,
  badges: [
    {
      _id: 'badge-1',
      name: 'JavaScript Master',
      description: 'Completed 10 JavaScript lessons',
      icon: '/badges/js-master.png'
    }
  ],
  loading: false,
  getUserPoints: jest.fn().mockReturnValue(100),
  getUserLevel: jest.fn().mockReturnValue(5),
  getCurrentStreak: jest.fn().mockReturnValue(7),
  getUserBadges: jest.fn(),
  updateDailyGoal: jest.fn(),
  recordActivity: jest.fn()
};

const mockAnalyticsContext = {
  trackPageView: jest.fn(),
  trackLearningSession: jest.fn(),
  trackContentView: jest.fn(),
  trackSearch: jest.fn(),
  getLearningProgress: jest.fn().mockReturnValue([
    {
      topic: 'JavaScript',
      overallProgress: 70,
      subtopics: [
        { name: 'Variables', progress: 80 },
        { name: 'Functions', progress: 60 }
      ]
    }
  ]),
  getUserInsights: jest.fn().mockReturnValue({
    learningStyle: 'visual',
    preferredTopics: [
      { topic: 'JavaScript', score: 90 },
      { topic: 'React', score: 80 }
    ],
    strengths: [
      { topic: 'JavaScript', score: 85 }
    ],
    areasForImprovement: [
      { topic: 'CSS', score: 60 }
    ]
  }),
  getRecommendations: jest.fn().mockReturnValue([
    {
      type: 'topic',
      item: 'React',
      reason: 'Based on your interest in JavaScript',
      score: 85
    }
  ]),
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

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Learn Page Integration', () => {
    test('should ask a question and display response', async () => {
      const askQuestionMock = jest.fn().mockResolvedValue({
        content: 'JavaScript is a programming language...',
        citations: [{ id: 'citation-1', title: 'JavaScript Documentation' }],
        followUpQuestions: ['What are JavaScript frameworks?']
      });
      
      renderWithProviders(<Learn />, {
        learning: { askQuestion: askQuestionMock }
      });
      
      // Find the query input and submit button
      const queryInput = screen.getByPlaceholderText(/Ask a question/i);
      fireEvent.change(queryInput, { target: { value: 'What is JavaScript?' } });
      
      const submitButton = screen.getByRole('button', { name: /ask/i });
      fireEvent.click(submitButton);
      
      // Check if askQuestion was called with the right parameters
      expect(askQuestionMock).toHaveBeenCalledWith('What is JavaScript?', expect.any(Object));
      
      // Wait for the response to be displayed
      await waitFor(() => {
        expect(screen.getByText(/JavaScript is a programming language/i)).toBeInTheDocument();
      });
      
      // Check if follow-up questions are displayed
      expect(screen.getByText(/What are JavaScript frameworks/i)).toBeInTheDocument();
    });
    
    test('should handle follow-up questions', async () => {
      const askFollowUpMock = jest.fn().mockResolvedValue({
        content: 'Popular JavaScript frameworks include React, Vue, and Angular...',
        citations: [{ id: 'citation-2', title: 'JavaScript Frameworks' }]
      });
      
      renderWithProviders(<Learn />, {
        learning: { askFollowUpQuestion: askFollowUpMock }
      });
      
      // Find and click a follow-up question
      const followUpButton = screen.getByText(/What are JavaScript frameworks/i);
      fireEvent.click(followUpButton);
      
      // Check if askFollowUpQuestion was called
      expect(askFollowUpMock).toHaveBeenCalled();
      
      // Wait for the response to be displayed
      await waitFor(() => {
        expect(screen.getByText(/Popular JavaScript frameworks include React, Vue, and Angular/i)).toBeInTheDocument();
      });
    });
    
    test('should save content', async () => {
      const saveContentMock = jest.fn().mockResolvedValue({ _id: 'content-123' });
      
      renderWithProviders(<Learn />, {
        learning: { saveContent: saveContentMock }
      });
      
      // Find and click the save button
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);
      
      // Check if saveContent was called
      expect(saveContentMock).toHaveBeenCalled();
      
      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/saved/i)).toBeInTheDocument();
      });
    });
    
    test('should generate learning path', async () => {
      const generatePathMock = jest.fn().mockResolvedValue({ pathId: 'path-123' });
      
      renderWithProviders(<Learn />, {
        learning: { generateLearningPath: generatePathMock }
      });
      
      // Find and click the learning path button
      const pathButton = screen.getByRole('button', { name: /learning path/i });
      fireEvent.click(pathButton);
      
      // Check if generateLearningPath was called
      expect(generatePathMock).toHaveBeenCalled();
    });
  });
  
  describe('Dashboard Integration', () => {
    test('should display user stats and recent activity', async () => {
      const getHistoryMock = jest.fn().mockResolvedValue([
        {
          _id: 'history-1',
          query: 'What is JavaScript?',
          queryTimestamp: new Date().toISOString()
        }
      ]);
      
      const getContentMock = jest.fn().mockResolvedValue([
        {
          _id: 'content-1',
          title: 'JavaScript Notes',
          type: 'note',
          createdAt: new Date().toISOString()
        }
      ]);
      
      renderWithProviders(<Dashboard />, {
        learning: {
          getHistory: getHistoryMock,
          getSavedContent: getContentMock
        }
      });
      
      // Check if user name is displayed
      expect(screen.getByText(/Test User/i)).toBeInTheDocument();
      
      // Check if points and level are displayed
      expect(screen.getByText(/100 pts/i)).toBeInTheDocument();
      expect(screen.getByText(/Level 5/i)).toBeInTheDocument();
      
      // Wait for history and content to be loaded
      await waitFor(() => {
        expect(screen.getByText(/What is JavaScript/i)).toBeInTheDocument();
        expect(screen.getByText(/JavaScript Notes/i)).toBeInTheDocument();
      });
    });
  });
  
  describe('Gamification Integration', () => {
    test('should display badges and streak', () => {
      renderWithProviders(<Gamification />);
      
      // Check if badges are displayed
      expect(screen.getByText(/JavaScript Master/i)).toBeInTheDocument();
      
      // Check if streak is displayed
      expect(screen.getByText(/7 days/i)).toBeInTheDocument();
      
      // Check if points and level are displayed
      expect(screen.getByText(/100 pts/i)).toBeInTheDocument();
      expect(screen.getByText(/Level 5/i)).toBeInTheDocument();
    });
    
    test('should update daily goal', async () => {
      const updateGoalMock = jest.fn().mockResolvedValue({
        dailyGoals: { target: 20 }
      });
      
      renderWithProviders(<Gamification />, {
        gamification: { updateDailyGoal: updateGoalMock }
      });
      
      // Find and click the update goal button
      const updateButton = screen.getByRole('button', { name: /update goal/i });
      fireEvent.click(updateButton);
      
      // Find the input and change the value
      const goalInput = screen.getByLabelText(/daily goal/i);
      fireEvent.change(goalInput, { target: { value: '20' } });
      
      // Find and click the save button
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);
      
      // Check if updateDailyGoal was called with the right parameters
      expect(updateGoalMock).toHaveBeenCalledWith(20);
    });
  });
  
  describe('Analytics Integration', () => {
    test('should display learning progress and insights', () => {
      renderWithProviders(<Analytics />);
      
      // Check if learning progress is displayed
      expect(screen.getByText(/JavaScript/i)).toBeInTheDocument();
      expect(screen.getByText(/70%/i)).toBeInTheDocument();
      
      // Check if user insights are displayed
      expect(screen.getByText(/Visual/i)).toBeInTheDocument();
      expect(screen.getByText(/Preferred Topics/i)).toBeInTheDocument();
      expect(screen.getByText(/Strengths/i)).toBeInTheDocument();
      expect(screen.getByText(/Areas for Improvement/i)).toBeInTheDocument();
      
      // Check if recommendations are displayed
      expect(screen.getByText(/React/i)).toBeInTheDocument();
      expect(screen.getByText(/Based on your interest in JavaScript/i)).toBeInTheDocument();
    });
    
    test('should track page view', () => {
      renderWithProviders(<Analytics />);
      
      // Check if trackPageView was called
      expect(mockAnalyticsContext.trackPageView).toHaveBeenCalledWith('analytics');
    });
  });
});
