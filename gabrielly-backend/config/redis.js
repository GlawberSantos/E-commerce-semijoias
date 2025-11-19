import Redis from 'ioredis';
import pino from 'pino';

const logger = pino();

// Redis é opcional - só conecta se as variáveis estiverem definidas
let redisClient = null;
let redisConnected = false;

if (process.env.REDIS_HOST || process.env.REDIS_URL) {
  try {
    redisClient = new Redis({
      port: process.env.REDIS_PORT || 6379,
      host: process.env.REDIS_HOST || '127.0.0.1',
      password: process.env.REDIS_PASSWORD || undefined,
      db: process.env.REDIS_DB || 0,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
      maxRetriesPerRequest: 3,
    });

    redisClient.on('connect', () => {
      logger.info('✅ Conectado ao Redis');
      redisConnected = true;
    });

    redisClient.on('error', (err) => {
      logger.warn('⚠️  Redis indisponível - usando cache em memória:', err.message);
      redisConnected = false;
    });
  } catch (error) {
    logger.warn('⚠️  Não foi possível inicializar Redis - usando cache em memória');
  }
} else {
  logger.info('ℹ️  Redis não configurado - usando cache em memória');
}

export { redisConnected };
export default redisClient;

redisClient.on('ready', () => {
  logger.info('✅ Redis pronto para usar');
});

export default redisClient;
