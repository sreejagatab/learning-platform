import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, AuthContext } from '../context/AuthContext';
import { LearningProvider, LearningContext } from '../context/LearningContext';
import { GamificationProvider, GamificationContext } from '../context/GamificationContext';
import { AnalyticsProvider, AnalyticsContext } from '../context/AnalyticsContext';

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
  gamificationAPI: {
    getGamificationData: jest.fn(),
    updateDailyGoal: jest.fn(),
    recordActivity: jest.fn(),
    getBadges: jest.fn(),
    getUserBadges: jest.fn(),
    markBadgeAsDisplayed: jest.fn()
  },
  analyticsAPI: {
    trackActivity: jest.fn(),
    getLearningProgress: jest.fn(),
    getUserInsights: jest.fn(),
    getRecommendations: jest.fn(),
    getUserActivity: jest.fn()
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

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });
  
  test('should provide initial state', () => {
    const TestComponent = () => {
      const { user, isAuthenticated, loading } = React.useContext(AuthContext);
      return (
        <div>
          <div data-testid="user">{JSON.stringify(user)}</div>
          <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
          <div data-testid="loading">{loading.toString()}</div>
        </div>
      );
    };
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
  });
  
  test('should login user', async () => {
    const mockUser = {
      _id: 'user-123',
      name: 'Test User',
      email: 'test@example.com'
    };
    
    const mockToken = 'mock-token';
    
    // Mock the login API call
    const { authAPI } = require('../services/api');
    authAPI.login.mockResolvedValue({ token: mockToken });
    authAPI.getProfile.mockResolvedValue(mockUser);
    
    const TestComponent = () => {
      const { user, isAuthenticated, loading, login } = React.useContext(AuthContext);
      
      React.useEffect(() => {
        if (!isAuthenticated && !loading) {
          login('test@example.com', 'password123');
        }
      }, [isAuthenticated, loading, login]);
      
      return (
        <div>
          <div data-testid="user">{user ? user.name : 'No user'}</div>
          <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
          <div data-testid="loading">{loading.toString()}</div>
        </div>
      );
    };
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    
    // Check if localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockToken);
    
    // Check if API calls were made
    expect(authAPI.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(authAPI.getProfile).toHaveBeenCalled();
  });
  
  test('should register user', async () => {
    const mockUser = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123'
    };
    
    const mockToken = 'mock-token';
    
    // Mock the register API call
    const { authAPI } = require('../services/api');
    authAPI.register.mockResolvedValue({ token: mockToken });
    authAPI.getProfile.mockResolvedValue(mockUser);
    
    const TestComponent = () => {
      const { user, isAuthenticated, loading, register } = React.useContext(AuthContext);
      
      React.useEffect(() => {
        if (!isAuthenticated && !loading) {
          register(mockUser);
        }
      }, [isAuthenticated, loading, register]);
      
      return (
        <div>
          <div data-testid="user">{user ? user.name : 'No user'}</div>
          <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
          <div data-testid="loading">{loading.toString()}</div>
        </div>
      );
    };
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Wait for registration to complete
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('New User');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    
    // Check if localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockToken);
    
    // Check if API calls were made
    expect(authAPI.register).toHaveBeenCalledWith(mockUser);
    expect(authAPI.getProfile).toHaveBeenCalled();
  });
  
  test('should logout user', async () => {
    // Set initial state with a logged in user
    localStorageMock.setItem('token', 'mock-token');
    
    const mockUser = {
      _id: 'user-123',
      name: 'Test User',
      email: 'test@example.com'
    };
    
    // Mock the getProfile API call
    const { authAPI } = require('../services/api');
    authAPI.getProfile.mockResolvedValue(mockUser);
    
    const TestComponent = () => {
      const { user, isAuthenticated, loading, logout } = React.useContext(AuthContext);
      
      return (
        <div>
          <div data-testid="user">{user ? user.name : 'No user'}</div>
          <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
          <div data-testid="loading">{loading.toString()}</div>
          <button onClick={logout}>Logout</button>
        </div>
      );
    };
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });
    
    // Click logout button
    fireEvent.click(screen.getByText('Logout'));
    
    // Check if user was logged out
    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    
    // Check if localStorage was cleared
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });
});

describe('LearningContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should provide initial state', () => {
    const TestComponent = () => {
      const { 
        currentQuery, 
        currentResponse, 
        queryLoading, 
        queryError, 
        sessionMessages,
        followUpQuestions,
        citations
      } = React.useContext(LearningContext);
      
      return (
        <div>
          <div data-testid="currentQuery">{currentQuery || 'No query'}</div>
          <div data-testid="currentResponse">{currentResponse || 'No response'}</div>
          <div data-testid="queryLoading">{queryLoading.toString()}</div>
          <div data-testid="queryError">{queryError || 'No error'}</div>
          <div data-testid="sessionMessages">{sessionMessages.length}</div>
          <div data-testid="followUpQuestions">{followUpQuestions.length}</div>
          <div data-testid="citations">{citations.length}</div>
        </div>
      );
    };
    
    render(
      <LearningProvider>
        <TestComponent />
      </LearningProvider>
    );
    
    expect(screen.getByTestId('currentQuery')).toHaveTextContent('No query');
    expect(screen.getByTestId('currentResponse')).toHaveTextContent('No response');
    expect(screen.getByTestId('queryLoading')).toHaveTextContent('false');
    expect(screen.getByTestId('queryError')).toHaveTextContent('No error');
    expect(screen.getByTestId('sessionMessages')).toHaveTextContent('0');
    expect(screen.getByTestId('followUpQuestions')).toHaveTextContent('0');
    expect(screen.getByTestId('citations')).toHaveTextContent('0');
  });
  
  test('should ask a question', async () => {
    const mockResponse = {
      content: 'JavaScript is a programming language...',
      citations: [
        { id: 'citation-1', title: 'JavaScript Documentation', url: 'https://example.com/js-docs' }
      ],
      followUpQuestions: [
        'What are JavaScript frameworks?',
        'How is JavaScript different from Java?'
      ],
      sessionId: 'test-session-id'
    };
    
    // Mock the askQuestion API call
    const { learningAPI } = require('../services/api');
    learningAPI.askQuestion.mockResolvedValue(mockResponse);
    
    const TestComponent = () => {
      const { 
        currentQuery, 
        currentResponse, 
        queryLoading, 
        sessionMessages,
        followUpQuestions,
        citations,
        askQuestion
      } = React.useContext(LearningContext);
      
      return (
        <div>
          <div data-testid="currentQuery">{currentQuery || 'No query'}</div>
          <div data-testid="currentResponse">{currentResponse || 'No response'}</div>
          <div data-testid="queryLoading">{queryLoading.toString()}</div>
          <div data-testid="sessionMessages">{sessionMessages.length}</div>
          <div data-testid="followUpQuestions">{followUpQuestions.length}</div>
          <div data-testid="citations">{citations.length}</div>
          <button onClick={() => askQuestion('What is JavaScript?')}>Ask</button>
        </div>
      );
    };
    
    render(
      <LearningProvider>
        <TestComponent />
      </LearningProvider>
    );
    
    // Click ask button
    fireEvent.click(screen.getByText('Ask'));
    
    // Check if loading state is set
    expect(screen.getByTestId('queryLoading')).toHaveTextContent('true');
    
    // Wait for response
    await waitFor(() => {
      expect(screen.getByTestId('currentQuery')).toHaveTextContent('What is JavaScript?');
      expect(screen.getByTestId('currentResponse')).toHaveTextContent('JavaScript is a programming language...');
      expect(screen.getByTestId('queryLoading')).toHaveTextContent('false');
      expect(screen.getByTestId('sessionMessages')).toHaveTextContent('2'); // User message + AI response
      expect(screen.getByTestId('followUpQuestions')).toHaveTextContent('2');
      expect(screen.getByTestId('citations')).toHaveTextContent('1');
    });
    
    // Check if API call was made
    expect(learningAPI.askQuestion).toHaveBeenCalledWith('What is JavaScript?', expect.any(Object));
  });
  
  test('should save content', async () => {
    const mockContent = {
      title: 'JavaScript Notes',
      content: 'My notes on JavaScript',
      type: 'note'
    };
    
    const mockSavedContent = {
      ...mockContent,
      _id: 'content-123',
      user: 'user-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Mock the saveContent API call
    const { learningAPI } = require('../services/api');
    learningAPI.saveContent.mockResolvedValue(mockSavedContent);
    
    const TestComponent = () => {
      const { saveContent } = React.useContext(LearningContext);
      const [savedContent, setSavedContent] = React.useState(null);
      
      const handleSave = async () => {
        const result = await saveContent(mockContent);
        setSavedContent(result);
      };
      
      return (
        <div>
          <div data-testid="savedContent">{savedContent ? savedContent.title : 'No content'}</div>
          <button onClick={handleSave}>Save</button>
        </div>
      );
    };
    
    render(
      <LearningProvider>
        <TestComponent />
      </LearningProvider>
    );
    
    // Click save button
    fireEvent.click(screen.getByText('Save'));
    
    // Wait for save to complete
    await waitFor(() => {
      expect(screen.getByTestId('savedContent')).toHaveTextContent('JavaScript Notes');
    });
    
    // Check if API call was made
    expect(learningAPI.saveContent).toHaveBeenCalledWith(mockContent);
  });
});

describe('GamificationContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should provide initial state', () => {
    const TestComponent = () => {
      const { 
        points, 
        level, 
        streak, 
        badges, 
        loading 
      } = React.useContext(GamificationContext);
      
      return (
        <div>
          <div data-testid="points">{points}</div>
          <div data-testid="level">{level}</div>
          <div data-testid="streak">{streak}</div>
          <div data-testid="badges">{badges.length}</div>
          <div data-testid="loading">{loading.toString()}</div>
        </div>
      );
    };
    
    render(
      <GamificationProvider>
        <TestComponent />
      </GamificationProvider>
    );
    
    expect(screen.getByTestId('points')).toHaveTextContent('0');
    expect(screen.getByTestId('level')).toHaveTextContent('1');
    expect(screen.getByTestId('streak')).toHaveTextContent('0');
    expect(screen.getByTestId('badges')).toHaveTextContent('0');
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
  });
  
  test('should load gamification data', async () => {
    const mockGamificationData = {
      points: {
        total: 100
      },
      level: {
        current: 5
      },
      streak: {
        current: 7
      },
      badges: [
        {
          badge: {
            _id: 'badge-1',
            name: 'JavaScript Master',
            description: 'Completed 10 JavaScript lessons',
            icon: '/badges/js-master.png'
          },
          earnedAt: new Date().toISOString(),
          displayed: true
        }
      ]
    };
    
    // Mock the getGamificationData API call
    const { gamificationAPI } = require('../services/api');
    gamificationAPI.getGamificationData.mockResolvedValue(mockGamificationData);
    
    const TestComponent = () => {
      const { 
        points, 
        level, 
        streak, 
        badges, 
        loading,
        loadGamificationData
      } = React.useContext(GamificationContext);
      
      React.useEffect(() => {
        loadGamificationData();
      }, [loadGamificationData]);
      
      return (
        <div>
          <div data-testid="points">{points}</div>
          <div data-testid="level">{level}</div>
          <div data-testid="streak">{streak}</div>
          <div data-testid="badges">{badges.length}</div>
          <div data-testid="loading">{loading.toString()}</div>
        </div>
      );
    };
    
    render(
      <GamificationProvider>
        <TestComponent />
      </GamificationProvider>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('points')).toHaveTextContent('100');
      expect(screen.getByTestId('level')).toHaveTextContent('5');
      expect(screen.getByTestId('streak')).toHaveTextContent('7');
      expect(screen.getByTestId('badges')).toHaveTextContent('1');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    
    // Check if API call was made
    expect(gamificationAPI.getGamificationData).toHaveBeenCalled();
  });
  
  test('should record activity', async () => {
    const mockActivityResponse = {
      pointsEarned: 10,
      newBadges: []
    };
    
    // Mock the recordActivity API call
    const { gamificationAPI } = require('../services/api');
    gamificationAPI.recordActivity.mockResolvedValue(mockActivityResponse);
    
    const TestComponent = () => {
      const { recordActivity } = React.useContext(GamificationContext);
      const [result, setResult] = React.useState(null);
      
      const handleRecord = async () => {
        const response = await recordActivity({
          type: 'learning_session',
          duration: 15,
          details: {
            topic: 'JavaScript'
          }
        });
        setResult(response);
      };
      
      return (
        <div>
          <div data-testid="pointsEarned">{result ? result.pointsEarned : 0}</div>
          <button onClick={handleRecord}>Record</button>
        </div>
      );
    };
    
    render(
      <GamificationProvider>
        <TestComponent />
      </GamificationProvider>
    );
    
    // Click record button
    fireEvent.click(screen.getByText('Record'));
    
    // Wait for record to complete
    await waitFor(() => {
      expect(screen.getByTestId('pointsEarned')).toHaveTextContent('10');
    });
    
    // Check if API call was made
    expect(gamificationAPI.recordActivity).toHaveBeenCalledWith({
      type: 'learning_session',
      duration: 15,
      details: {
        topic: 'JavaScript'
      }
    });
  });
});

describe('AnalyticsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should provide initial state', () => {
    const TestComponent = () => {
      const { loading } = React.useContext(AnalyticsContext);
      
      return (
        <div>
          <div data-testid="loading">{loading.toString()}</div>
        </div>
      );
    };
    
    render(
      <AnalyticsProvider>
        <TestComponent />
      </AnalyticsProvider>
    );
    
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });
  
  test('should track page view', async () => {
    // Mock the trackActivity API call
    const { analyticsAPI } = require('../services/api');
    analyticsAPI.trackActivity.mockResolvedValue({ message: 'Activity tracked' });
    
    const TestComponent = () => {
      const { trackPageView } = React.useContext(AnalyticsContext);
      
      React.useEffect(() => {
        trackPageView('dashboard');
      }, [trackPageView]);
      
      return <div>Test Component</div>;
    };
    
    render(
      <AnalyticsProvider>
        <TestComponent />
      </AnalyticsProvider>
    );
    
    // Wait for tracking to complete
    await waitFor(() => {
      expect(analyticsAPI.trackActivity).toHaveBeenCalledWith({
        activityType: 'page_view',
        details: {
          page: 'dashboard'
        }
      });
    });
  });
  
  test('should get learning progress', async () => {
    const mockProgress = [
      {
        topic: 'JavaScript',
        overallProgress: 70,
        subtopics: [
          { name: 'Variables', progress: 80 },
          { name: 'Functions', progress: 60 }
        ]
      }
    ];
    
    // Mock the getLearningProgress API call
    const { analyticsAPI } = require('../services/api');
    analyticsAPI.getLearningProgress.mockResolvedValue(mockProgress);
    
    const TestComponent = () => {
      const { getLearningProgress } = React.useContext(AnalyticsContext);
      const [progress, setProgress] = React.useState([]);
      
      const handleGetProgress = async () => {
        const result = await getLearningProgress();
        setProgress(result);
      };
      
      return (
        <div>
          <div data-testid="progress">{progress.length > 0 ? progress[0].topic : 'No progress'}</div>
          <button onClick={handleGetProgress}>Get Progress</button>
        </div>
      );
    };
    
    render(
      <AnalyticsProvider>
        <TestComponent />
      </AnalyticsProvider>
    );
    
    // Click get progress button
    fireEvent.click(screen.getByText('Get Progress'));
    
    // Wait for progress to load
    await waitFor(() => {
      expect(screen.getByTestId('progress')).toHaveTextContent('JavaScript');
    });
    
    // Check if API call was made
    expect(analyticsAPI.getLearningProgress).toHaveBeenCalled();
  });
});
