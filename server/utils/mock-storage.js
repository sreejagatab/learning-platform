/**
 * Mock storage utility for development and testing
 * Simulates database operations with in-memory storage
 */

// In-memory storage for mock data
const mockStorage = {
  learningPaths: [],
  nextId: 1
};

/**
 * Save a learning path to mock storage
 * 
 * @param {Object} path - Learning path object to save
 * @returns {Object} - Saved learning path with ID
 */
const saveLearningPath = (path) => {
  const id = mockStorage.nextId++;
  const newPath = {
    ...path,
    _id: id.toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockStorage.learningPaths.push(newPath);
  return newPath;
};

/**
 * Get a learning path by ID
 * 
 * @param {String} id - Learning path ID
 * @returns {Object|null} - Learning path or null if not found
 */
const getLearningPathById = (id) => {
  return mockStorage.learningPaths.find(path => path._id === id) || null;
};

/**
 * Update a learning path
 * 
 * @param {String} id - Learning path ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} - Updated learning path or null if not found
 */
const updateLearningPath = (id, updates) => {
  const index = mockStorage.learningPaths.findIndex(path => path._id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedPath = {
    ...mockStorage.learningPaths[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  mockStorage.learningPaths[index] = updatedPath;
  return updatedPath;
};

/**
 * Get all learning paths
 * 
 * @returns {Array} - Array of learning paths
 */
const getAllLearningPaths = () => {
  return [...mockStorage.learningPaths];
};

/**
 * Delete a learning path
 * 
 * @param {String} id - Learning path ID
 * @returns {Boolean} - True if deleted, false if not found
 */
const deleteLearningPath = (id) => {
  const index = mockStorage.learningPaths.findIndex(path => path._id === id);
  
  if (index === -1) {
    return false;
  }
  
  mockStorage.learningPaths.splice(index, 1);
  return true;
};

/**
 * Clear all mock storage (for testing)
 */
const clearStorage = () => {
  mockStorage.learningPaths = [];
  mockStorage.nextId = 1;
};

module.exports = {
  saveLearningPath,
  getLearningPathById,
  updateLearningPath,
  getAllLearningPaths,
  deleteLearningPath,
  clearStorage
};
