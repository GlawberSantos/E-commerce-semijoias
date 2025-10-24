// Configuração da URL da API
// Em produção, use a URL do Railway
// Em desenvolvimento, use localhost

const API_BASE_URL =
  (import.meta.env.VITE_API_URL?.replace(/\/$/, '')) ||
  (process.env.REACT_APP_API_URL?.replace(/\/$/, '')) ||
  'https://e-commerce-semijoias-production.up.railway.app';

// Helper para fazer requisições à API
const api = {
  // GET request
  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Para enviar cookies se necessário
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição GET:', error);
      throw error;
    }
  },

  // POST request
  async post(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição POST:', error);
      throw error;
    }
  },

  // PUT request
  async put(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição PUT:', error);
      throw error;
    }
  },

  // DELETE request
  async delete(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição DELETE:', error);
      throw error;
    }
  },
};

// Funções específicas para cada endpoint
export const productsAPI = {
  getAll: (category = null) => {
    const endpoint = category
      ? `/api/products?category=${category}`  // ✅ Importante: com /api/
      : '/api/products';
    return api.get(endpoint);
  },

  getById: (id) => api.get(`/api/products/${id}`),
};

export const ordersAPI = {
  // Criar pedido
  create: (orderData) => api.post('/api/orders', orderData),

  // Confirmar pagamento
  confirm: (orderId) => api.post(`/api/orders/${orderId}/confirm`),

  // Cancelar pedido
  cancel: (orderId) => api.post(`/api/orders/${orderId}/cancel`),

  // Listar todos os pedidos
  getAll: () => api.get('/api/orders'),

  // Buscar pedido por ID
  getById: (orderId) => api.get(`/api/orders/${orderId}`),
};

export const shippingAPI = {
  // Calcular frete
  calculate: (shippingData) => api.post('/api/frete/calcular', shippingData),
};

export const statsAPI = {
  // Produtos com estoque baixo
  getLowStock: () => api.get('/api/stats/low-stock'),

  // Resumo de vendas
  getSales: () => api.get('/api/stats/sales'),
};

export const chatAPI = {
  // Enviar mensagem para o chatbot
  sendMessage: (message) => api.post('/chat', { message }),
};

// Exportar URL base para uso direto se necessário
export { API_BASE_URL };

// Export default com todas as APIs
export default {
  products: productsAPI,
  orders: ordersAPI,
  shipping: shippingAPI,
  stats: statsAPI,
  chat: chatAPI,
};