// src/api.js

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  import.meta.env.VITE_API_URL ||
  'https://e-commerce-semijoias-production.up.railway.app/api'
).replace(/\/$/, '');

console.log('🔗 API_BASE_URL configurada para:', API_BASE_URL);

const api = {
  async get(endpoint) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('📡 GET:', url);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    return await response.json();
  },

  async post(endpoint, data) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('📡 POST:', url, data);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || `Erro HTTP: ${response.status}`);
    }
    return await response.json();
  },

  async put(endpoint, data) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('📡 PUT:', url, data);
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: `Erro HTTP: ${response.status}` }));
      throw new Error(errorBody.message || `Erro HTTP: ${response.status}`);
    }
    return await response.json();
  },
};

// ==================== EXPORTAÇÕES ====================

export const productsAPI = {
  getAll: (category = null) =>
    api.get(category ? `/products?category=${category}` : '/products'),
  getById: (id) => api.get(`/products/${id}`),
};

export const shippingAPI = {
  calculate: (shippingData) => api.post('/frete/calcular', shippingData),
};

export const ordersAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  confirm: (id) => api.post(`/orders/${id}/confirm`, {}),
  cancel: (id) => api.post(`/orders/${id}/cancel`, {}),
};

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  updateDetails: (details) => api.put('/auth/account/details', details),
  updatePassword: (passwords) => api.put('/auth/account/password', passwords),
};

export { API_BASE_URL };