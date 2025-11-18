// config/securityHeaders.js
// 🛡️ Configuração de Headers HTTP de Segurança

import helmet from 'helmet';

/**
 * Configuração Helmet.js com headers de segurança OWASP
 */
export const securityHeaders = helmet({
  // Previne clickjacking
  frameguard: {
    action: 'deny', // DENY - não permitir em iframes
  },

  // Previne MIME type sniffing
  noSniff: true,

  // XSS Protection header
  xssFilter: true,

  // Referrer Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      scriptSrc: [
        '\'self\'',
        '\'unsafe-inline\'', // Apenas para desenvolvimento! Remove em produção
        'https://cdn.jsdelivr.net',
        'https://api.openrouter.io',
      ],
      styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https://fonts.googleapis.com'],
      imgSrc: ['\'self\'', 'data:', 'https:', 'blob:'],
      fontSrc: ['\'self\'', 'https://fonts.gstatic.com'],
      connectSrc: [
        '\'self\'',
        'https://api.openrouter.io',
        'https://api.mercadopago.com',
        'https://www.melhorenvio.com.br',
      ],
      frameSrc: ['\'none\''],
      formAction: ['\'self\''],
      upgradeInsecureRequests: [], // Ativado em produção
    },
  },

  // HSTS - Force HTTPS
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true,
  },

  // Permissões do navegador
  permittedCrossDomainPolicies: false,
});

/**
 * Headers adicionais de segurança
 */
export const additionalSecurityHeaders = (req, res, next) => {
  // Previne caching de dados sensíveis
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Remove header X-Powered-By
  res.removeHeader('X-Powered-By');

  // Remove header Server (revela tecnologia)
  res.setHeader('Server', 'Gabrielly API');

  // Permissões de Feature Policy
  res.setHeader(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );

  // Remove header X-AspNet-Version se existir
  res.removeHeader('X-AspNet-Version');

  // Remove header X-Runtime
  res.removeHeader('X-Runtime');

  next();
};

/**
 * Força HTTPS em produção
 */
export const forceHTTPS = (req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
};

/**
 * Limita tamanho de payloads
 */
export const payloadLimiter = {
  json: {
    limit: '10mb',
  },
  urlencoded: {
    limit: '10mb',
    extended: true,
  },
};

export default {
  securityHeaders,
  additionalSecurityHeaders,
  forceHTTPS,
  payloadLimiter,
};
