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

const userService = {
  async getAllUsers() {
    const response = await api.get('/api/users');
    return response.data;
  },

  async getUserById(id: string) {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/api/profile');
    return response.data;
  },

  async updateUser(id: string, userData: any) {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },
};

export default userService;