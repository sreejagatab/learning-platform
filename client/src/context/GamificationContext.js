import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from './AuthContext';

const GamificationContext = createContext();

export const GamificationProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  
  const [gamificationData, setGamificationData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch gamification data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchGamificationData();
    }
  }, [isAuthenticated, authLoading]);

  // Fetch user's gamification data
  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/gamification');
      setGamificationData(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching gamification data');
      console.error('Error fetching gamification data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all available badges
  const fetchBadges = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/gamification/badges');
      setBadges(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching badges');
      console.error('Error fetching badges:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/gamification/leaderboard');
      setLeaderboard(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching leaderboard');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update daily goal
  const updateDailyGoal = async (target) => {
    try {
      setLoading(true);
      const res = await axios.put('/api/gamification/daily-goal', { target });
      
      // Update only the dailyGoals part of the state
      setGamificationData(prevData => ({
        ...prevData,
        dailyGoals: res.data.data
      }));
      
      toast.success('Daily goal updated successfully');
      setError(null);
      return res.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error updating daily goal';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error updating daily goal:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Record learning activity
  const recordActivity = async (activityType, duration = 0, details = {}) => {
    try {
      const res = await axios.post('/api/gamification/activity', {
        activityType,
        duration,
        details
      });
      
      // Update gamification data with new values
      fetchGamificationData();
      
      // Check if points were awarded
      if (res.data.data.pointsAwarded > 0) {
        toast.success(`+${res.data.data.pointsAwarded} points earned!`);
      }
      
      return res.data.data;
    } catch (err) {
      console.error('Error recording activity:', err);
      return null;
    }
  };

  // Get user's current streak
  const getCurrentStreak = () => {
    return gamificationData?.streak?.current || 0;
  };

  // Get user's level
  const getUserLevel = () => {
    return gamificationData?.level?.current || 1;
  };

  // Get user's points
  const getUserPoints = () => {
    return gamificationData?.points?.total || 0;
  };

  // Get user's badges
  const getUserBadges = () => {
    return gamificationData?.badges || [];
  };

  // Get daily goal progress
  const getDailyGoalProgress = () => {
    if (!gamificationData || !gamificationData.dailyGoals) {
      return { current: 0, target: 10, percentage: 0 };
    }
    
    const { progress, target } = gamificationData.dailyGoals;
    const percentage = Math.min(100, Math.round((progress / target) * 100));
    
    return { current: progress, target, percentage };
  };

  return (
    <GamificationContext.Provider
      value={{
        gamificationData,
        badges,
        leaderboard,
        loading,
        error,
        fetchGamificationData,
        fetchBadges,
        fetchLeaderboard,
        updateDailyGoal,
        recordActivity,
        getCurrentStreak,
        getUserLevel,
        getUserPoints,
        getUserBadges,
        getDailyGoalProgress
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export default GamificationContext;
