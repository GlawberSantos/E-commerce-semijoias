// src/api.js

const API_BASE_URL = (
  // 1. Prioriza o REACT_APP_API_URL (que você confirmou ser o que funciona para o catálogo)
  process.env.REACT_APP_API_URL ||

  // 2. Tenta ler VITE_API_URL (Convenção do Vite, caso use esse padrão)
  import.meta.env.VITE_API_URL ||

  // 3. Fallback Final (URL completa do Railway, incluindo /api)
  'https://e-commerce-semijoias-production.up.railway.app/api'
)
  // Remove apenas a barra final (/) para garantir que a URL base não tenha barra dupla,
  // mas MANTÉM o '/api' que é crucial para o catálogo funcionar.
  .replace(/\/$/, '');

// O console.log aqui irá mostrar o valor que está sendo usado. 
// Deve ser: https://e-commerce-semijoias-production.up.railway.app/api
console.log('🔗 API_BASE_URL configurada para:', API_BASE_URL);


const api = {
  async get(endpoint) {
    // endpoint já deve vir sem o /api
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('Requisição GET para:', url);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    return await response.json();
  },

  async post(endpoint, data) {
    // endpoint já deve vir sem o /api
    const url = `${API_BASE_URL}${endpoint}`;
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
};

export const productsAPI = {
  // ALTERAÇÃO: Removemos o '/api' do início aqui, pois ele já está no API_BASE_URL
  getAll: (category = null) =>
    api.get(category ? `/products?category=${category}` : '/products'),
  getById: (id) => api.get(`/products/${id}`),
};

export const shippingAPI = {
  // ALTERAÇÃO: Removemos o '/api' do início para corrigir a chamada de frete
  calculate: (shippingData) => api.post('/frete/calcular', shippingData),
};

export { API_BASE_URL };