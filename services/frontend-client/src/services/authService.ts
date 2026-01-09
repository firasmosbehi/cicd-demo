import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });
        
        const { token, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

const authService = {
  async login(credentials: { email: string; password: string }) {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  async register(userData: any) {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    await api.post('/api/auth/logout', { refreshToken });
  },

  async getCurrentUser() {
    const response = await api.get('/api/profile');
    return response.data;
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
      refreshToken,
    });
    return response.data;
  },
};

export default authService;