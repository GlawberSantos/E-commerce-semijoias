// src/api.js

const API_BASE_URL = (
  // 1. Tenta ler a variável VITE_API_URL (Convenção do Vite)
  import.meta.env.VITE_API_URL ||

  // 2. Tenta ler a variável REACT_APP_API_URL (Sua variável de trabalho)
  process.env.REACT_APP_API_URL ||

  // 3. Fallback final (URL do Railway)
  'https://e-commerce-semijoias-production.up.railway.app'
)
  .replace(/\/$/, '') // Remove barra final (/) da URL base
  .replace(/\/api$/, ''); // Remove o '/api' se estiver no final (para evitar duplicidade)

// =================================================================
// ADICIONAMOS A LÓGICA DE VERIFICAÇÃO PARA DEBUG
// SE VOCÊ AINDA VER LOCALHOST, O PROBLEMA ESTÁ NO DEPLOY/CACHE DO VERCEL
// =================================================================
console.log('🔗 API_BASE_URL configurada para:', API_BASE_URL);


const api = {
  async get(endpoint) {
    const url = `${API_BASE_URL}${endpoint}`; // URL completa
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    return await response.json();
  },

  async post(endpoint, data) {
    const url = `${API_BASE_URL}${endpoint}`; // URL completa
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
  // Os endpoints de chamada precisam do /api/ se o API_BASE_URL não o contiver
  getAll: (category = null) =>
    api.get(category ? `/api/products?category=${category}` : '/api/products'),
  getById: (id) => api.get(`/api/products/${id}`),
};

export const shippingAPI = {
  calculate: (shippingData) => api.post('/api/frete/calcular', shippingData),
};

export { API_BASE_URL };