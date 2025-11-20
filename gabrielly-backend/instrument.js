// ==================== SENTRY ERROR TRACKING ====================
// Este arquivo deve ser importado no TOPO do seu arquivo principal (server.js)
// Inicializa o Sentry para monitoramento de erros em produção

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import dotenv from 'dotenv';
import logger from './utils/logger.js'; // Importar o logger centralizado

dotenv.config();

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN && SENTRY_DSN.trim() !== '') {
  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        nodeProfilingIntegration(),
      ],
      tracesSampleRate: 1.0,
      sendDefaultPii: true,
      profilesSampleRate: 1.0,
    });
    logger.info('✅ Sentry inicializado com sucesso');
  } catch (error) {
    logger.warn({ err: error }, '⚠️  Erro ao inicializar Sentry: %s', error.message);
  }
} else {
  logger.warn('⚠️  SENTRY_DSN não configurado. Sentry desativado.');
}

export { Sentry };
