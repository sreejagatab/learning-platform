import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/me', userData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

// Learning API calls
export const learningAPI = {
  askQuestion: (query, options) => api.post('/learning/query', { query, options }),
  generateLearningPath: (topic, level) => api.post('/learning/path', { topic, level }),
  getHistory: (page, limit, search) => api.get('/history', { params: { page, limit, search } }),
  saveContent: (title, content, type, metadata) => api.post('/learning/save', { title, content, type, metadata }),
  getSavedContent: (type, page, limit) => api.get('/learning/content', { params: { type, page, limit } }),
  getContentById: (id) => api.get(`/learning/content/${id}`),
  deleteContent: (id) => api.delete(`/learning/content/${id}`),

  // Create new content with proper JSON formatting
  createContent: async (contentData) => {
    try {
      // Ensure contentData is properly formatted with all required fields
      const formattedData = {
        title: contentData.title || '',
        content: contentData.content || '',
        type: contentData.type || 'note',
        metadata: {
          tags: Array.isArray(contentData.metadata?.tags) ? contentData.metadata.tags : [],
          level: contentData.metadata?.level || 'beginner',
          topic: contentData.metadata?.topic || '',
          description: contentData.metadata?.description || ''
        }
      };

      // Validate required fields
      if (!formattedData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formattedData.content.trim()) {
        throw new Error('Content is required');
      }

      // Log the data being sent for debugging
      console.log('Creating content with data:', formattedData);

      // Set a timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      // Ensure the data is properly stringified
      const jsonData = JSON.stringify(formattedData);

      const response = await api.post('/learning/content', formattedData, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      console.error('Error in createContent API call:', error);

      // Enhance error message based on the type of error
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again later.');
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = error.response.data.message ||
                            error.response.data.error ||
                            `Server error: ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw error;
      }
    }
  },

  // Update existing content
  updateContent: async (id, contentData) => {
    try {
      // Ensure contentData is properly formatted with all required fields
      const formattedData = {
        title: contentData.title || '',
        content: contentData.content || '',
        type: contentData.type || 'note',
        metadata: {
          tags: Array.isArray(contentData.metadata?.tags) ? contentData.metadata.tags : [],
          level: contentData.metadata?.level || 'beginner',
          topic: contentData.metadata?.topic || '',
          description: contentData.metadata?.description || ''
        }
      };

      // Validate required fields
      if (!formattedData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formattedData.content.trim()) {
        throw new Error('Content is required');
      }

      // Log the data being sent for debugging
      console.log('Updating content with data:', formattedData);

      // Set a timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      // Ensure the data is properly stringified
      const jsonData = JSON.stringify(formattedData);

      const response = await api.put(`/learning/content/${id}`, formattedData, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      console.error('Error in updateContent API call:', error);

      // Enhance error message based on the type of error
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again later.');
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = error.response.data.message ||
                            error.response.data.error ||
                            `Server error: ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw error;
      }
    }
  }
};

// User API calls
export const userAPI = {
  getStats: () => api.get('/users/stats'),
  updatePreferences: (preferences) => api.put('/users/preferences', { preferences }),
};

export default api;
