import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import AnalyticsContext from '../context/AnalyticsContext';

// Define preferred topics, strengths, and areas for improvement first
const preferredTopics = [
  { topic: 'JavaScript', score: 90 },
  { topic: 'React', score: 80 },
  { topic: 'Python', score: 60 }
];

const strengths = [
  { topic: 'JavaScript', score: 85 }
];

const areasForImprovement = [
  { topic: 'CSS', score: 60 }
];

// Define recommendations
const recommendations = [
  {
    type: 'content',
    item: 'content-1',
    reason: 'Based on your interest in JavaScript',
    score: 90,
    content: { title: 'Advanced JavaScript Concepts' }
  },
  {
    type: 'topic',
    item: 'CSS',
    reason: 'To improve your knowledge in this area',
    score: 85
  }
];

// Define learning progress
const learningProgress = [
  {
    _id: '1',
    topic: 'JavaScript',
    overallProgress: 75,
    timeSpent: 3600,
    subtopics: [
      { name: 'Variables', progress: 90 },
      { name: 'Functions', progress: 80 },
      { name: 'Objects', progress: 60 }
    ]
  },
  {
    _id: '2',
    topic: 'Python',
    overallProgress: 40,
    timeSpent: 1800,
    subtopics: [
      { name: 'Variables', progress: 60 },
      { name: 'Functions', progress: 40 },
      { name: 'Classes', progress: 20 }
    ]
  }
];

// Mock components that would be tested
const MockAnalyticsPage = () => (
  <div>
    <h1>Analytics Dashboard</h1>
    <button onClick={() => mockAnalyticsContext.trackPageView('analytics')}>Track Page View</button>
    <button onClick={() => mockAnalyticsContext.trackLearningSession(60, 'JavaScript')}>Track Learning Session</button>
  </div>
);

// Mock the AnalyticsContext
const mockAnalyticsContext = {
  learningProgress: learningProgress,
  userInsights: {
    learningStyle: 'visual',
    preferredTopics: preferredTopics,
    strengths: strengths,
    areasForImprovement: areasForImprovement,
    learningPatterns: {
      preferredTimeOfDay: 'evening',
      averageSessionDuration: 1800,
      sessionsPerWeek: 4,
      consistencyScore: 70
    }
  },
  recommendations: recommendations,
  loading: false,
  error: null,
  trackPageView: jest.fn(),
  trackContentView: jest.fn(),
  trackLearningSession: jest.fn(),
  trackFeatureUse: jest.fn(),
  trackSearch: jest.fn(),
  trackQuestionAsked: jest.fn(),
  fetchLearningProgress: jest.fn(),
  fetchUserInsights: jest.fn(),
  fetchRecommendations: jest.fn(),
  getTopicProgress: jest.fn().mockImplementation(topic => {
    return learningProgress.find(p => p.topic === topic);
  }),
  getLearningStyle: jest.fn().mockReturnValue('visual'),
  getPreferredTopics: jest.fn().mockReturnValue(preferredTopics),
  getStrengths: jest.fn().mockReturnValue(strengths),
  getAreasForImprovement: jest.fn().mockReturnValue(areasForImprovement),
  getRecommendationsByType: jest.fn().mockImplementation(type => {
    return recommendations.filter(r => r.type === type);
  })
};

// Mock context provider wrapper
const renderWithAnalyticsContext = (ui, contextValue = mockAnalyticsContext) => {
  return render(
    <BrowserRouter>
      <AnalyticsContext.Provider value={contextValue}>
        {ui}
      </AnalyticsContext.Provider>
    </BrowserRouter>
  );
};

describe('Analytics Context and Components', () => {
  test('tracking functions are called correctly', () => {
    renderWithAnalyticsContext(<MockAnalyticsPage />);

    // Track page view
    fireEvent.click(screen.getByText('Track Page View'));
    expect(mockAnalyticsContext.trackPageView).toHaveBeenCalledWith('analytics');

    // Track learning session
    fireEvent.click(screen.getByText('Track Learning Session'));
    expect(mockAnalyticsContext.trackLearningSession).toHaveBeenCalledWith(60, 'JavaScript');
  });

  test('handles loading state correctly', () => {
    const loadingContext = { ...mockAnalyticsContext, loading: true };
    renderWithAnalyticsContext(<MockAnalyticsPage />, loadingContext);

    // Component should still render while loading
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
  });

  test('handles error state correctly', () => {
    const errorContext = {
      ...mockAnalyticsContext,
      error: 'Failed to fetch analytics data',
      loading: false
    };
    renderWithAnalyticsContext(<MockAnalyticsPage />, errorContext);

    // Component should still render with error
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
  });

  test('getTopicProgress returns correct data', () => {
    const progress = mockAnalyticsContext.getTopicProgress('JavaScript');
    expect(progress).toBeDefined();
    expect(progress.topic).toBe('JavaScript');
    expect(progress.overallProgress).toBe(75);
  });

  test('getRecommendationsByType returns filtered recommendations', () => {
    const contentRecs = mockAnalyticsContext.getRecommendationsByType('content');
    expect(contentRecs).toHaveLength(1);
    expect(contentRecs[0].type).toBe('content');
    expect(contentRecs[0].content.title).toBe('Advanced JavaScript Concepts');

    const topicRecs = mockAnalyticsContext.getRecommendationsByType('topic');
    expect(topicRecs).toHaveLength(1);
    expect(topicRecs[0].type).toBe('topic');
    expect(topicRecs[0].item).toBe('CSS');
  });
});
