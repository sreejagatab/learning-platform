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
  askQuestion: (query, level) => api.post('/learning/ask', { query, level }),
  generateLearningPath: (topic, level) => api.post('/learning/path', { topic, level }),
  getHistory: (page, limit, search) => api.get('/learning/history', { params: { page, limit, search } }),
  saveContent: (title, content, type, metadata) => api.post('/learning/save', { title, content, type, metadata }),
  getSavedContent: (type, page, limit) => api.get('/learning/saved', { params: { type, page, limit } }),
  getContentById: (id) => api.get(`/learning/content/${id}`),
  deleteContent: (id) => api.delete(`/learning/content/${id}`),
};

// User API calls
export const userAPI = {
  getStats: () => api.get('/users/stats'),
  updatePreferences: (preferences) => api.put('/users/preferences', { preferences }),
};

export default api;
