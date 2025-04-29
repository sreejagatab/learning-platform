import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from './AuthContext';

const AnalyticsContext = createContext();

export const AnalyticsProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

  const [learningProgress, setLearningProgress] = useState([]);
  const [userInsights, setUserInsights] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch analytics data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchLearningProgress();
      fetchUserInsights();
      fetchRecommendations();
    }
  }, [isAuthenticated, authLoading]);

  // Track page view
  const trackPageView = async (page) => {
    if (!isAuthenticated) return;

    try {
      await axios.post('/api/analytics/track', {
        activityType: 'page_view',
        details: {
          page
        }
      });
    } catch (err) {
      console.error('Error tracking page view:', err);
    }
  };

  // Track content view
  const trackContentView = async (contentId, contentType) => {
    if (!isAuthenticated) return;

    try {
      await axios.post('/api/analytics/track', {
        activityType: 'content_view',
        details: {
          contentId,
          contentType
        }
      });
    } catch (err) {
      console.error('Error tracking content view:', err);
    }
  };

  // Track learning session
  const trackLearningSession = async (sessionDuration, topic, subtopic = null) => {
    if (!isAuthenticated || !sessionDuration) return;

    try {
      await axios.post('/api/analytics/track', {
        activityType: 'learning_session',
        details: {
          sessionDuration,
          topic,
          subtopic,
          sessionId: generateSessionId()
        }
      });

      // Refresh learning progress after tracking a session
      fetchLearningProgress();
    } catch (err) {
      console.error('Error tracking learning session:', err);
    }
  };

  // Track feature use
  const trackFeatureUse = async (feature, metadata = {}) => {
    if (!isAuthenticated) return;

    try {
      await axios.post('/api/analytics/track', {
        activityType: 'feature_use',
        details: {
          feature,
          metadata
        }
      });
    } catch (err) {
      console.error('Error tracking feature use:', err);
    }
  };

  // Track search query
  const trackSearch = async (query) => {
    if (!isAuthenticated || !query) return;

    try {
      await axios.post('/api/analytics/track', {
        activityType: 'search',
        details: {
          query
        }
      });
    } catch (err) {
      console.error('Error tracking search:', err);
    }
  };

  // Track question asked
  const trackQuestionAsked = async (query) => {
    if (!isAuthenticated || !query) return;

    try {
      await axios.post('/api/analytics/track', {
        activityType: 'question_asked',
        details: {
          query
        }
      });
    } catch (err) {
      console.error('Error tracking question:', err);
    }
  };

  // Fetch user's learning progress
  const fetchLearningProgress = async (topic = null) => {
    try {
      setLoading(true);

      let url = '/api/analytics/progress';
      if (topic) {
        url += `?topic=${encodeURIComponent(topic)}`;
      }

      const res = await axios.get(url);
      setLearningProgress(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching learning progress');
      console.error('Error fetching learning progress:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user insights
  const fetchUserInsights = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/analytics/insights');
      setUserInsights(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching user insights');
      console.error('Error fetching user insights:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recommendations
  const fetchRecommendations = async (type = null, limit = 10) => {
    try {
      setLoading(true);

      let url = `/api/analytics/recommendations?limit=${limit}`;
      if (type) {
        url += `&type=${encodeURIComponent(type)}`;
      }

      const res = await axios.get(url);
      setRecommendations(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching recommendations');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user activity history
  const fetchActivityHistory = async (activityType = null, page = 1, limit = 50) => {
    try {
      setLoading(true);

      let url = `/api/analytics/activity?page=${page}&limit=${limit}`;
      if (activityType) {
        url += `&activityType=${encodeURIComponent(activityType)}`;
      }

      const res = await axios.get(url);
      setActivityHistory(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching activity history');
      console.error('Error fetching activity history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate a session ID
  const generateSessionId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  // Get progress for a specific topic
  const getTopicProgress = (topic) => {
    if (!learningProgress || learningProgress.length === 0) {
      return null;
    }

    return learningProgress.find(p => p.topic === topic) || null;
  };

  // Get user's learning style
  const getLearningStyle = () => {
    if (!userInsights) {
      return 'multimodal';
    }

    return userInsights.learningStyle;
  };

  // Get user's preferred topics
  const getPreferredTopics = (limit = 3) => {
    if (!userInsights || !userInsights.preferredTopics) {
      return [];
    }

    return userInsights.preferredTopics.slice(0, limit);
  };

  // Get user's strengths
  const getStrengths = (limit = 3) => {
    if (!userInsights || !userInsights.strengths) {
      return [];
    }

    return userInsights.strengths.slice(0, limit);
  };

  // Get user's areas for improvement
  const getAreasForImprovement = (limit = 3) => {
    if (!userInsights || !userInsights.areasForImprovement) {
      return [];
    }

    return userInsights.areasForImprovement.slice(0, limit);
  };

  // Get recommendations by type
  const getRecommendationsByType = (type, limit = 5) => {
    if (!recommendations || recommendations.length === 0) {
      return [];
    }

    return recommendations
      .filter(rec => rec.type === type)
      .slice(0, limit);
  };

  return (
    <AnalyticsContext.Provider
      value={{
        learningProgress,
        userInsights,
        recommendations,
        activityHistory,
        loading,
        error,
        trackPageView,
        trackContentView,
        trackLearningSession,
        trackFeatureUse,
        trackSearch,
        trackQuestionAsked,
        fetchLearningProgress,
        fetchUserInsights,
        fetchRecommendations,
        fetchActivityHistory,
        getTopicProgress,
        getLearningStyle,
        getPreferredTopics,
        getStrengths,
        getAreasForImprovement,
        getRecommendationsByType
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

// Custom hook to use the analytics context
export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export default AnalyticsContext;
