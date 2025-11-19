// middleware/csrfProtection.js
// 🛡️ Proteção contra CSRF (Cross-Site Request Forgery)

import crypto from 'crypto';
import logger from '../config/logger.js';

// Armazenar tokens CSRF em memória
// Formato: { sessionId: { token: string, createdAt: timestamp } }
const csrfTokenStore = new Map();

// Limpar tokens expirados a cada 1 hora
const CSRF_TOKEN_EXPIRY = 3600000; // 1 hora em ms
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokenStore.entries()) {
    if (now - data.createdAt > CSRF_TOKEN_EXPIRY) {
      csrfTokenStore.delete(sessionId);
    }
  }
}, CSRF_TOKEN_EXPIRY);

/**
 * Gera um novo token CSRF
 * @param {string} sessionId - ID único da sessão/usuário
 * @returns {string} Token CSRF gerado
 */
export const generateCSRFToken = (sessionId) => {
  if (!sessionId) {
    throw new Error('sessionId é obrigatório para gerar token CSRF');
  }

  // Gerar token aleatório de 32 bytes
  const token = crypto.randomBytes(32).toString('hex');

  // Armazenar com timestamp
  csrfTokenStore.set(sessionId, {
    token,
    createdAt: Date.now(),
  });

  logger.info(`🔐 Token CSRF gerado para sessão: ${sessionId}`);
  return token;
};

/**
 * Valida um token CSRF
 * @param {string} sessionId - ID da sessão/usuário
 * @param {string} token - Token a validar
 * @returns {boolean} True se válido, false caso contrário
 */
export const validateCSRFToken = (sessionId, token) => {
  if (!sessionId || !token) {
    logger.warn('⚠️ Tentativa de validar CSRF sem sessionId ou token');
    return false;
  }

  const storedData = csrfTokenStore.get(sessionId);

  if (!storedData) {
    logger.warn(`⚠️ Token CSRF não encontrado para sessão: ${sessionId}`);
    return false;
  }

  // Verificar expiração
  if (Date.now() - storedData.createdAt > CSRF_TOKEN_EXPIRY) {
    csrfTokenStore.delete(sessionId);
    logger.warn(`⚠️ Token CSRF expirado para sessão: ${sessionId}`);
    return false;
  }

  // Comparar tokens com timing-safe comparison
  const isValid = crypto.timingSafeEqual(
    Buffer.from(storedData.token),
    Buffer.from(token)
  );

  if (isValid) {
    // Remover token após validação (one-time use)
    csrfTokenStore.delete(sessionId);
    logger.info(`✅ Token CSRF validado e removido para sessão: ${sessionId}`);
  } else {
    logger.warn(`❌ Token CSRF inválido para sessão: ${sessionId}`);
  }

  return isValid;
};

/**
 * Middleware Express para proteger contra CSRF
 * Valida token em POST, PUT, DELETE, PATCH
 */
export const csrfProtectionMiddleware = (req, res, next) => {
  // Apenas validar em operações que modificam dados
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

    if (!token || !sessionId) {
      logger.warn(`❌ CSRF: Token ou sessionId ausente em ${req.method} ${req.path}`);
      return res.status(403).json({
        success: false,
        error: 'CSRF token ausente',
      });
    }

    if (!validateCSRFToken(sessionId, token)) {
      logger.warn(`❌ CSRF: Validação falhou em ${req.method} ${req.path}`);
      return res.status(403).json({
        success: false,
        error: 'CSRF token inválido ou expirado',
      });
    }
  }

  next();
};

/**
 * Middleware para gerar token CSRF em requisições GET
 * Retorna o token para ser usado em formulários/requests subsequentes
 */
export const csrfTokenMiddleware = (req, res, next) => {
  if (req.method === 'GET') {
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    
    if (sessionId) {
      const token = generateCSRFToken(sessionId);
      res.set('X-CSRF-Token', token);
    }
  }

  next();
};

/**
 * Helper para remover token CSRF (logout)
 */
export const clearCSRFToken = (sessionId) => {
  if (csrfTokenStore.has(sessionId)) {
    csrfTokenStore.delete(sessionId);
    logger.info(`🔄 Token CSRF limpo para sessão: ${sessionId}`);
  }
};

export default {
  generateCSRFToken,
  validateCSRFToken,
  csrfProtectionMiddleware,
  csrfTokenMiddleware,
  clearCSRFToken,
};
