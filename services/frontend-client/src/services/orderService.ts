import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_ORDER_SERVICE_URL || 'http://localhost:3002';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const orderService = {
  async getAllOrders() {
    const response = await api.get('/api/orders');
    return response.data;
  },

  async getOrderById(id: string) {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },

  async createOrder(orderData: any) {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },

  async updateOrder(id: string, orderData: any) {
    const response = await api.put(`/api/orders/${id}`, orderData);
    return response.data;
  },

  async deleteOrder(id: string) {
    const response = await api.delete(`/api/orders/${id}`);
    return response.data;
  },
};

export default orderService;