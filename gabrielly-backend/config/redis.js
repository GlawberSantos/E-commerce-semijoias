import Redis from 'ioredis';
import pino from 'pino';

const logger = pino();

const redisClient = new Redis({
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
});

redisClient.on('connect', () => {
  logger.info('✅ Conectado ao Redis');
});

redisClient.on('error', (err) => {
  logger.error('❌ Erro na conexão com o Redis:', err);
});

redisClient.on('ready', () => {
  logger.info('✅ Redis pronto para usar');
});

export default redisClient;
