import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from './AuthContext';

const LearningContext = createContext();

export const LearningProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  
  // State for learning session
  const [currentQuery, setCurrentQuery] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState(null);
  const [currentResponse, setCurrentResponse] = useState(null);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [citations, setCitations] = useState([]);
  
  // State for learning paths
  const [learningPaths, setLearningPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [pathLoading, setPathLoading] = useState(false);
  
  // State for saved content
  const [savedContent, setSavedContent] = useState([]);
  const [contentLoading, setContentLoading] = useState(false);
  
  // State for learning history
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // User preferences
  const [userLevel, setUserLevel] = useState('intermediate');

  // Ask a question and get response
  const askQuestion = async (query, options = {}) => {
    if (!isAuthenticated) {
      toast.error('Please log in to use this feature');
      return null;
    }
    
    setQueryLoading(true);
    setQueryError(null);
    setCurrentQuery(query);
    
    try {
      // Include user level and preferences
      const requestOptions = {
        ...options,
        level: options.level || userLevel
      };
      
      const res = await axios.post('/api/learning/query', {
        query,
        options: requestOptions
      });
      
      const { content, citations, followUpQuestions, sessionId: newSessionId } = res.data;
      
      // Update state with response data
      setCurrentResponse(content);
      setCitations(citations || []);
      setFollowUpQuestions(followUpQuestions || []);
      
      // If this is a new session, set the session ID
      if (!sessionId && newSessionId) {
        setSessionId(newSessionId);
      }
      
      // Add message to session history
      const newMessage = {
        role: 'user',
        content: query,
        timestamp: new Date().toISOString()
      };
      
      const assistantMessage = {
        role: 'assistant',
        content,
        citations,
        followUpQuestions,
        timestamp: new Date().toISOString()
      };
      
      setSessionMessages([...sessionMessages, newMessage, assistantMessage]);
      
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to get response';
      setQueryError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setQueryLoading(false);
    }
  };
  
  // Ask a follow-up question
  const askFollowUpQuestion = async (followUpQuery) => {
    if (!isAuthenticated || sessionMessages.length === 0) {
      toast.error('No active learning session');
      return null;
    }
    
    setQueryLoading(true);
    setQueryError(null);
    setCurrentQuery(followUpQuery);
    
    try {
      const res = await axios.post('/api/learning/follow-up', {
        followUpQuery,
        messages: sessionMessages,
        sessionId,
        level: userLevel
      });
      
      const { content, citations, followUpQuestions: newFollowUps } = res.data;
      
      // Update state with response data
      setCurrentResponse(content);
      setCitations(citations || []);
      setFollowUpQuestions(newFollowUps || []);
      
      // Add messages to session history
      const newMessage = {
        role: 'user',
        content: followUpQuery,
        timestamp: new Date().toISOString()
      };
      
      const assistantMessage = {
        role: 'assistant',
        content,
        citations,
        followUpQuestions: newFollowUps,
        timestamp: new Date().toISOString()
      };
      
      setSessionMessages([...sessionMessages, newMessage, assistantMessage]);
      
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to get response for follow-up';
      setQueryError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setQueryLoading(false);
    }
  };
  
  // Generate a learning path
  const generateLearningPath = async (topic) => {
    if (!isAuthenticated) {
      toast.error('Please log in to use this feature');
      return null;
    }
    
    setPathLoading(true);
    
    try {
      const res = await axios.post('/api/learning/path', {
        topic,
        level: userLevel
      });
      
      const newPath = res.data;
      setCurrentPath(newPath);
      setLearningPaths([newPath, ...learningPaths]);
      
      toast.success(`Learning path for "${topic}" created successfully`);
      return newPath;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to generate learning path';
      toast.error(errorMessage);
      return null;
    } finally {
      setPathLoading(false);
    }
  };
  
  // Save content
  const saveContent = async (title, content, type = 'note', metadata = {}) => {
    if (!isAuthenticated) {
      toast.error('Please log in to use this feature');
      return false;
    }
    
    setContentLoading(true);
    
    try {
      const res = await axios.post('/api/learning/save', {
        title,
        content,
        type,
        metadata
      });
      
      toast.success('Content saved successfully');
      return res.data.contentId;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save content';
      toast.error(errorMessage);
      return false;
    } finally {
      setContentLoading(false);
    }
  };
  
  // Get user's saved content
  const getUserContent = async (type = null, page = 1, limit = 10) => {
    if (!isAuthenticated) {
      return [];
    }
    
    setContentLoading(true);
    
    try {
      const params = { page, limit };
      if (type) params.type = type;
      
      const res = await axios.get('/api/learning/content', { params });
      
      setSavedContent(res.data.content);
      return res.data;
    } catch (err) {
      console.error('Error fetching content:', err);
      return { content: [], pagination: { total: 0 } };
    } finally {
      setContentLoading(false);
    }
  };
  
  // Get content by ID
  const getContentById = async (contentId) => {
    if (!isAuthenticated) {
      return null;
    }
    
    setContentLoading(true);
    
    try {
      const res = await axios.get(`/api/learning/content/${contentId}`);
      return res.data;
    } catch (err) {
      console.error('Error fetching content:', err);
      return null;
    } finally {
      setContentLoading(false);
    }
  };
  
  // Get user's learning history
  const getLearningHistory = async (page = 1, limit = 10, query = '') => {
    if (!isAuthenticated) {
      return { history: [], pagination: { total: 0 } };
    }
    
    setHistoryLoading(true);
    
    try {
      const params = { page, limit };
      if (query) params.query = query;
      
      const res = await axios.get('/api/history', { params });
      
      setHistoryItems(res.data.history);
      return res.data;
    } catch (err) {
      console.error('Error fetching history:', err);
      return { history: [], pagination: { total: 0 } };
    } finally {
      setHistoryLoading(false);
    }
  };
  
  // Clear current session
  const clearSession = () => {
    setCurrentQuery('');
    setCurrentResponse(null);
    setSessionMessages([]);
    setSessionId(null);
    setFollowUpQuestions([]);
    setCitations([]);
  };
  
  // Update user level
  const updateUserLevel = (level) => {
    setUserLevel(level);
  };
  
  return (
    <LearningContext.Provider
      value={{
        // Current session state
        currentQuery,
        currentResponse,
        queryLoading,
        queryError,
        sessionMessages,
        sessionId,
        followUpQuestions,
        citations,
        
        // Learning paths state
        learningPaths,
        currentPath,
        pathLoading,
        
        // Content state
        savedContent,
        contentLoading,
        
        // History state
        historyItems,
        historyLoading,
        
        // User preferences
        userLevel,
        
        // Methods
        askQuestion,
        askFollowUpQuestion,
        generateLearningPath,
        saveContent,
        getUserContent,
        getContentById,
        getLearningHistory,
        clearSession,
        updateUserLevel
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export default LearningContext;
