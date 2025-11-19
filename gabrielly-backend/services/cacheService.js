// services/cacheService.js
// ⚡ SISTEMA DE CACHE - Performance para Black Friday

import redisClient, { redisConnected } from '../config/redis.js';

// Cache em memória como fallback
const memoryCache = new Map();

// ==================== FUNÇÕES PRINCIPAIS ====================

/**
 * Busca valor no cache (Redis ou memória)
 * @param {string} key - Chave do cache
 * @returns {*} Valor armazenado ou undefined
 */
export const get = async (key) => {
  try {
    // Tenta Redis primeiro
    if (redisClient && redisConnected) {
      const value = await redisClient.get(key);
      if (value !== null) {
        console.log(`📦 Cache HIT (Redis): ${key}`);
        return JSON.parse(value);
      }
    }
    
    // Fallback para memória
    const cached = memoryCache.get(key);
    if (cached && cached.expires > Date.now()) {
      console.log(`📦 Cache HIT (Memory): ${key}`);
      return cached.value;
    }
    
    console.log(`💨 Cache MISS: ${key}`);
    return undefined;
  } catch (error) {
    console.error(`❌ Erro ao buscar cache ${key}:`, error.message);
    return undefined;
  }
};

/**
 * Armazena valor no cache (Redis ou memória)
 * @param {string} key - Chave do cache
 * @param {*} value - Valor a ser armazenado
 * @param {number} ttl - Tempo de vida em segundos (opcional, padrão 300s)
 * @returns {boolean} true se sucesso
 */
export const set = async (key, value, ttl = 300) => {
  try {
    // Tenta Redis primeiro
    if (redisClient && redisConnected) {
      const stringValue = JSON.stringify(value);
      await redisClient.setex(key, ttl, stringValue);
      console.log(`💾 Cache SAVED (Redis): ${key} (TTL: ${ttl}s)`);
    }
    
    // Também armazena em memória como fallback
    memoryCache.set(key, {
      value,
      expires: Date.now() + (ttl * 1000)
    });
    console.log(`💾 Cache SAVED (Memory): ${key} (TTL: ${ttl}s)`);
    
    return true;
  } catch (error) {
    console.error(`❌ Erro ao salvar cache ${key}:`, error.message);
    return false;
  }
};

/**
 * Remove valor do cache
 * @param {string} key - Chave do cache
 * @returns {number} 1 se sucesso, 0 se não encontrou
 */
export const del = async (key) => {
  try {
    // Remove do Redis
    if (redisClient && redisConnected) {
      await redisClient.del(key);
    }
    
    // Remove da memória
    return memoryCache.delete(key) ? 1 : 0;
  } catch (error) {
    console.error(`❌ Erro ao deletar cache ${key}:`, error.message);
    return 0;
  }
};

/**
 * Limpa todo o cache Redis
 */
export const flush = async () => {
  try {
    await redisClient.flushdb();
    console.log('🗑️ Cache Redis completamente limpo');
  } catch (error) {
    console.error('❌ Erro ao limpar cache Redis:', error);
  }
};

/**
 * Remove items por padrão no cache Redis
 * @param {string} pattern - Padrão de busca (ex: 'products:*')
 * @returns {number} Quantidade de items removidos
 */
export const clearPattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      const deletedCount = await redisClient.del(keys);
      console.log(`🗑️ Cache Redis pattern cleared: ${pattern} (${deletedCount} items)`);
      return deletedCount;
    }
    return 0;
  } catch (error) {
    console.error(`❌ Erro ao limpar pattern ${pattern} no Redis:`, error);
    return 0;
  }
};

/**
 * Obtém informações do servidor Redis (não estatísticas de cache específicas)
 * @returns {Object} Informações do Redis
 */
export const getStats = async () => {
  try {
    const info = await redisClient.info('memory');
    const keysCount = await redisClient.dbsize();
    return {
      redisMemory: info,
      keysCount: keysCount,
      // NodeCache stats like hits/misses are not directly available in Redis info
      // You would need to implement custom counters for that if needed
    };
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas do Redis:', error);
    return {};
  }
};

/**
 * Lista todas as chaves do cache Redis (use com cautela em produção)
 * @returns {Array} Array de chaves
 */
export const keys = async (pattern = '*') => {
  try {
    return await redisClient.keys(pattern);
  } catch (error) {
    console.error('❌ Erro ao listar chaves do Redis:', error);
    return [];
  }
};

// ==================== MIDDLEWARE DE CACHE ====================

/**
 * Middleware Express para cache automático de rotas GET usando Redis
 * @param {number} duration - Duração do cache em segundos
 * @returns {Function} Middleware Express
 */
export const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    // Só cachear requisições GET
    if (req.method !== 'GET') {
      return next();
    }

    // Criar chave única baseada na URL e query params
    const key = `route:${req.originalUrl || req.url}`;
    
    // Tentar buscar no cache
    const cachedResponse = await get(key);
    
    if (cachedResponse !== undefined) {
      // Se encontrou no cache, retornar imediatamente
      return res.json(cachedResponse);
    }

    // Se não encontrou, interceptar res.json para salvar no cache
    const originalJson = res.json.bind(res);
    
    res.json = async (data) => {
      // Salvar no cache
      await set(key, data, duration);
      // Chamar json original
      return originalJson(data);
    };

    next();
  };
};

// ==================== FUNÇÕES ESPECÍFICAS PARA O E-COMMERCE ====================

/**
 * Cache de produtos
 */
export const cacheProducts = {
  getAll: async (category = 'all') => get(`products:${category}`),
  setAll: async (category = 'all', data) => set(`products:${category}`, data, 600), // 10 minutos
  getOne: async (id) => get(`product:${id}`),
  setOne: async (id, data) => set(`product:${id}`, data, 600),
  clear: async () => clearPattern('product:*'),
  clearCategory: async (category) => del(`products:${category}`)
};

/**
 * Cache de pedidos
 */
export const cacheOrders = {
  getAll: async () => get('orders:all'),
  setAll: async (data) => set('orders:all', data, 60), // 1 minuto (dados sensíveis)
  getOne: async (id) => get(`order:${id}`),
  setOne: async (id, data) => set(`order:${id}`, data, 60),
  clear: async () => clearPattern('order:*')
};

/**
 * Cache de busca
 */
export const cacheSearch = {
  get: async (query) => get(`search:${query.toLowerCase()}`),
  set: async (query, data) => set(`search:${query.toLowerCase()}`, data, 300),
  clear: async () => clearPattern('search:*')
};

/**
 * Cache de frete
 */
export const cacheShipping = {
  get: async (cep) => get(`shipping:${cep}`),
  set: async (cep, data) => set(`shipping:${cep}`, data, 3600), // 1 hora (frete não muda rápido)
  clear: async () => clearPattern('shipping:*')
};

/**
 * Cache de estatísticas
 */
export const cacheStats = {
  getLowStock: async () => get('stats:low-stock'),
  setLowStock: async (data) => set('stats:low-stock', data, 300),
  getSales: async () => get('stats:sales'),
  setSales: async (data) => set('stats:sales', data, 300),
  clear: async () => clearPattern('stats:*')
};

// ==================== ESTRATÉGIAS DE INVALIDAÇÃO ====================

/**
 * Invalida cache quando produto é criado/atualizado
 */
export const invalidateProduct = async (productId, category) => {
  console.log(`🔄 Invalidando cache do produto ${productId}`);
  
  // Remove produto específico
  await del(`product:${productId}`);
  
  // Remove lista de produtos da categoria
  if (category) {
    await del(`products:${category}`);
  }
  
  // Remove lista geral
  await del('products:all');
  
  // Remove buscas (pois produto pode aparecer em resultados)
  await clearPattern('search:*');
  
  console.log('✅ Cache de produtos invalidado');
};

/**
 * Invalida cache quando pedido é criado/atualizado
 */
export const invalidateOrder = async (orderId) => {
  console.log(`🔄 Invalidando cache do pedido ${orderId}`);
  
  await del(`order:${orderId}`);
  await del('orders:all');
  
  // Invalida estatísticas pois pedidos afetam vendas
  await cacheStats.clear();
  
  console.log('✅ Cache de pedidos invalidado');
};

/**
 * Invalida cache de estoque
 */
export const invalidateStock = async (productId) => {
  console.log(`🔄 Invalidando cache de estoque do produto ${productId}`);
  
  await invalidateProduct(productId);
  await cacheStats.clear();
  
  console.log('✅ Cache de estoque invalidado');
};

/**
 * Limpa cache automaticamente em intervalos (apenas para padrões específicos)
 * @param {number} intervalMinutes - Intervalo em minutos
 */
export const scheduleFlush = (intervalMinutes = 60) => {
  setInterval(async () => {
    console.log('🔄 Limpeza automática de cache agendada');
    
    // Limpa buscas antigas (ex: a cada hora)
    await clearPattern('search:*');
    
    // Atualiza estatísticas (se houver)
    await cacheStats.clear();
    
    console.log('✅ Limpeza automática concluída');
  }, intervalMinutes * 60 * 1000);
};

// ==================== MONITORAMENTO ====================

/**
 * Retorna informações detalhadas do cache Redis
 */
export const getCacheInfo = async () => {
  const stats = await getStats();
  const allKeys = await keys();
  
  return {
    cache: 'Redis',
    status: 'active',
    ...stats,
    totalKeys: allKeys.length,
    keys: allKeys,
    keysByType: {
      products: (await keys('product:*')).length,
      orders: (await keys('order:*')).length,
      search: (await keys('search:*')).length,
      shipping: (await keys('shipping:*')).length,
      stats: (await keys('stats:*')).length,
      routes: (await keys('route:*')).length
    },
  };
};

/**
 * Endpoint para monitoramento do cache
 * USE EM UMA ROTA PROTEGIDA!
 */
export const cacheMonitorEndpoint = async (req, res) => {
  const info = await getCacheInfo();
  
  res.json(info);
};

// ==================== EXPORT ====================

export default {
  get,
  set,
  del,
  flush,
  clearPattern,
  getStats,
  keys,
  cacheMiddleware,
  cacheProducts,
  cacheOrders,
  cacheSearch,
  cacheShipping,
  cacheStats,
  invalidateProduct,
  invalidateOrder,
  invalidateStock,
  scheduleFlush,
  getCacheInfo,
  cacheMonitorEndpoint
};

// ==================== INICIALIZAÇÃO ====================

// Agendar limpeza automática a cada 1 hora
scheduleFlush(60);

console.log('✅ Cache Service iniciado com sucesso (usando Redis)');
