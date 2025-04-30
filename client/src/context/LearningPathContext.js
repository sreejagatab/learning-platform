import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import AuthContext from './AuthContext';

const LearningPathContext = createContext();

export const LearningPathProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  const [learningPaths, setLearningPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [pathLoading, setPathLoading] = useState(false);
  const [pathError, setPathError] = useState(null);

  // Load user's learning paths when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getUserLearningPaths();
    } else {
      setLearningPaths([]);
      setCurrentPath(null);
    }
  }, [isAuthenticated]);

  // Get all learning paths for the current user
  const getUserLearningPaths = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to view your learning paths');
      return [];
    }

    setPathLoading(true);
    setPathError(null);

    try {
      const response = await api.get('/learning-paths');
      setLearningPaths(response.data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load learning paths';
      setPathError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setPathLoading(false);
    }
  };

  // Create a new learning path
  const createLearningPath = async (topic, level = 'intermediate', preferences = {}) => {
    if (!isAuthenticated) {
      toast.error('Please log in to create a learning path');
      return null;
    }

    setPathLoading(true);
    setPathError(null);

    try {
      const response = await api.post('/learning-paths', {
        topic,
        level,
        preferences
      });

      const newPath = response.data;
      setCurrentPath(newPath);
      setLearningPaths(prevPaths => [newPath, ...prevPaths]);

      toast.success(`Learning path for "${topic}" created successfully`);
      return newPath;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create learning path';
      setPathError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setPathLoading(false);
    }
  };

  // Get a learning path by ID
  const getLearningPathById = async (pathId) => {
    if (!isAuthenticated) {
      toast.error('Please log in to view learning paths');
      return null;
    }

    setPathLoading(true);
    setPathError(null);

    try {
      const response = await api.get(`/learning-paths/${pathId}`);
      const path = response.data;
      setCurrentPath(path);
      return path;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load learning path';
      setPathError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setPathLoading(false);
    }
  };

  // Update a learning path
  const updateLearningPath = async (pathId, updates) => {
    if (!isAuthenticated) {
      toast.error('Please log in to update learning paths');
      return null;
    }

    setPathLoading(true);
    setPathError(null);

    try {
      const response = await api.put(`/learning-paths/${pathId}`, updates);
      const updatedPath = response.data;

      // Update the current path if it's the one being updated
      if (currentPath && currentPath._id === pathId) {
        setCurrentPath(updatedPath);
      }

      // Update the path in the list
      setLearningPaths(prevPaths =>
        prevPaths.map(path =>
          path._id === pathId ? updatedPath : path
        )
      );

      toast.success('Learning path updated successfully');
      return updatedPath;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update learning path';
      setPathError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setPathLoading(false);
    }
  };

  // Complete a step in a learning path
  const completeStep = async (pathId, stepId) => {
    if (!isAuthenticated) {
      toast.error('Please log in to update learning paths');
      return null;
    }

    try {
      const response = await api.post(`/learning-paths/${pathId}/steps/${stepId}/complete`);
      const updatedPath = response.data;

      // Update the current path if it's the one being updated
      if (currentPath && currentPath._id === pathId) {
        setCurrentPath(updatedPath);
      }

      // Update the path in the list
      setLearningPaths(prevPaths =>
        prevPaths.map(path =>
          path._id === pathId ? updatedPath : path
        )
      );

      toast.success('Step completed!');

      // Check if a checkpoint should be taken
      if (updatedPath.shouldTakeCheckpoint) {
        toast.info('You have reached a checkpoint! Take a quick quiz to test your knowledge.');
      }

      return updatedPath;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to complete step';
      toast.error(errorMessage);
      return null;
    }
  };

  // Take a checkpoint in a learning path
  const takeCheckpoint = async (pathId, checkpointId, answers) => {
    if (!isAuthenticated) {
      toast.error('Please log in to take checkpoints');
      return null;
    }

    try {
      const response = await api.post(`/learning-paths/${pathId}/checkpoints/${checkpointId}`, {
        answers
      });

      const result = response.data;

      // Update the current path
      if (currentPath && currentPath._id === pathId) {
        setCurrentPath(result.path);
      }

      // Update the path in the list
      setLearningPaths(prevPaths =>
        prevPaths.map(path =>
          path._id === pathId ? result.path : path
        )
      );

      // Show success or feedback based on score
      const { score, passingScore } = result.checkpoint;
      if (score >= passingScore) {
        toast.success(`Checkpoint passed with a score of ${score}%!`);
      } else {
        toast.info(`You scored ${score}%. Review the material and try again to improve your understanding.`);
      }

      return result;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to complete checkpoint';
      toast.error(errorMessage);
      return null;
    }
  };

  // Get prerequisites for a topic
  const getPrerequisites = async (topic, level = 'intermediate') => {
    if (!isAuthenticated) {
      toast.error('Please log in to view prerequisites');
      return [];
    }

    try {
      const response = await api.get(`/learning-paths/prerequisites?topic=${encodeURIComponent(topic)}&level=${level}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load prerequisites';
      toast.error(errorMessage);
      return [];
    }
  };

  // Create a branch in a learning path
  const createBranch = async (pathId, branchData) => {
    if (!isAuthenticated) {
      toast.error('Please log in to create branches');
      return null;
    }

    setPathLoading(true);
    setPathError(null);

    try {
      const response = await api.post(`/learning-paths/${pathId}/branches`, branchData);
      const updatedPath = response.data;

      // Update the current path if it's the one being updated
      if (currentPath && currentPath._id === pathId) {
        setCurrentPath(updatedPath);
      }

      // Update the path in the list
      setLearningPaths(prevPaths =>
        prevPaths.map(path =>
          path._id === pathId ? updatedPath : path
        )
      );

      toast.success(`Branch "${branchData.branchName}" created successfully`);
      return updatedPath;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create branch';
      setPathError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setPathLoading(false);
    }
  };

  // Adapt a learning path based on performance
  const adaptPath = async (pathId, performanceData) => {
    if (!isAuthenticated) {
      toast.error('Please log in to adapt learning paths');
      return null;
    }

    try {
      const response = await api.post(`/learning-paths/${pathId}/adapt`, performanceData);
      const updatedPath = response.data;

      // Update the current path if it's the one being updated
      if (currentPath && currentPath._id === pathId) {
        setCurrentPath(updatedPath);
      }

      // Update the path in the list
      setLearningPaths(prevPaths =>
        prevPaths.map(path =>
          path._id === pathId ? updatedPath : path
        )
      );

      toast.success('Learning path adapted based on your performance');
      return updatedPath;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to adapt learning path';
      toast.error(errorMessage);
      return null;
    }
  };

  return (
    <LearningPathContext.Provider
      value={{
        learningPaths,
        currentPath,
        pathLoading,
        pathError,
        getUserLearningPaths,
        createLearningPath,
        getLearningPathById,
        updateLearningPath,
        completeStep,
        takeCheckpoint,
        getPrerequisites,
        createBranch,
        adaptPath
      }}
    >
      {children}
    </LearningPathContext.Provider>
  );
};

export default LearningPathContext;
