import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

// Configuração do logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // Em produção, logamos como JSON. Em desenvolvimento, usamos um formato mais legível.
  transport: !isProduction ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  } : undefined,
  // Formatação em produção
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  // Adiciona timestamp em produção
  timestamp: isProduction ? pino.stdTimeFunctions.isoTime : false,
});

export default logger;
