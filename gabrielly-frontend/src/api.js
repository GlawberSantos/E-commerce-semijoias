// utils/api.js

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
  'https://e-commerce-semijoias-production.up.railway.app';

const api = {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    return await response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    return await response.json();
  },
};

export const productsAPI = {
  getAll: (category = null) =>
    api.get(category ? `/api/products?category=${category}` : '/api/products'),
  getById: (id) => api.get(`/api/products/${id}`),
};

export const shippingAPI = {
  calculate: (shippingData) => api.post('/api/frete/calcular', shippingData),
};

export { API_BASE_URL };
