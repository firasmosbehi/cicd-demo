import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_PRODUCT_SERVICE_URL || 'http://localhost:3003';

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

const productService = {
  async getAllProducts() {
    const response = await api.get('/api/products');
    return response.data;
  },

  async getProductById(id: string) {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  async createProduct(productData: any) {
    const response = await api.post('/api/products', productData);
    return response.data;
  },

  async updateProduct(id: string, productData: any) {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data;
  },

  async deleteProduct(id: string) {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  },
};

export default productService;