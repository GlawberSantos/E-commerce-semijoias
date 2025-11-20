// services/cacheService.js
// ⚡ SISTEMA DE CACHE EM MEMÓRIA - Performance para Black Friday

// Cache em memória
const memoryCache = new Map();

// ==================== FUNÇÕES PRINCIPAIS ====================

/**
 * Busca valor no cache
 * @param {string} key - Chave do cache
 * @returns {*} Valor armazenado ou undefined
 */
export const get = async (key) => {
  try {
    const cached = memoryCache.get(key);
    
    if (cached) {
      // Verifica se expirou
      if (cached.expires > Date.now()) {
        console.log(`📦 Cache HIT: ${key}`);
        return cached.value;
      }
      else {
        // Remove se expirado
        memoryCache.delete(key);
      }
    }
    
    console.log(`💨 Cache MISS: ${key}`);
    return undefined;
  } catch (error) {
    console.error(`❌ Erro ao buscar cache ${key}:`, error);
    return undefined;
  }
};

/**
 * Armazena valor no cache
 * @param {string} key - Chave do cache
 * @param {*} value - Valor a ser armazenado
 * @param {number} ttl - Tempo de vida em segundos (opcional, padrão 300s)
 * @returns {boolean} true se sucesso
 */
export const set = async (key, value, ttl = 300) => {
  try {
    memoryCache.set(key, {
      value,
      expires: Date.now() + (ttl * 1000)
    });
    console.log(`💾 Cache SAVED: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao salvar cache ${key}:`, error);
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
    const existed = memoryCache.has(key);
    if (existed) {
      memoryCache.delete(key);
      console.log(`🗑️ Cache REMOVED: ${key}`);
      return 1;
    }
    return 0;
  } catch (error) {
    console.error(`❌ Erro ao remover cache ${key}:`, error.message);
    return 0;
  }
};

/**
 * Limpa todo o cache
 * @returns {number} quantidade de chaves removidas
 */
export const flush = async () => {
  try {
    const size = memoryCache.size;
    memoryCache.clear();
    console.log(`🧹 Cache FLUSHED: ${size} chaves removidas`);
    return size;
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error.message);
    return 0;
  }
};

/**
 * Remove items por padrão no cache
 * @param {string} pattern - Padrão de busca (ex: 'products:*')
 * @returns {number} Quantidade de items removidos
 */
export const clearPattern = async (pattern) => {
  try {
    const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
    let deletedCount = 0;
    
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      console.log(`🗑️ Cache pattern cleared: ${pattern} (${deletedCount} items)`);
    }
    
    return deletedCount;
  } catch (error) {
    console.error(`❌ Erro ao limpar pattern ${pattern}:`, error.message);
    return 0;
  }
};

/**
 * Retorna informações/estatísticas do cache
 * @returns {Object} Objeto com estatísticas
 */
export const getStats = async () => {
  try {
    // Contar items válidos (não expirados)
    let validCount = 0;
    let expiredCount = 0;
    let totalSize = 0;
    
    for (const item of memoryCache.values()) {
      if (item.expires > Date.now()) {
        validCount++;
        totalSize += JSON.stringify(item.value).length;
      } else {
        expiredCount++;
      }
    }
    
    const stats = {
      type: 'memory',
      keys: validCount,
      expired: expiredCount,
      memory_used_bytes: totalSize,
      memory_used_mb: (totalSize / 1024 / 1024).toFixed(2),
      total_entries: memoryCache.size,
      timestamp: new Date()
    };
    
    console.log('📊 Cache Statistics:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Erro ao obter stats do cache:', error.message);
    return { type: 'memory', error: error.message };
  }
};

/**
 * Retorna todas as chaves do cache
 * @returns {Array<string>} Array de chaves
 */
export const keys = async (pattern = '*') => {
  try {
    const allKeys = Array.from(memoryCache.keys());
    
    if (pattern === '*') {
      return allKeys;
    }
    
    const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
    return allKeys.filter(key => regex.test(key));
  } catch (error) {
    console.error('❌ Erro ao listar chaves do cache:', error.message);
    return [];
  }
};

// ==================== MIDDLEWARE DE CACHE ====================

/**
 * Middleware Express para cache automático de rotas GET
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
 * Retorna informações detalhadas do cache
 */
export const getCacheInfo = async () => {
  const stats = await getStats();
  const allKeys = await keys();
  
  return {
    cache: 'memory',
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

console.log('✅ Cache Service iniciado com sucesso (usando cache em memória)');
