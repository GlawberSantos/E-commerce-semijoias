// ==================== SENTRY ERROR TRACKING ====================
// Este arquivo deve ser importado no TOPO do seu arquivo principal (server.js)
// Inicializa o Sentry para monitoramento de erros em produção

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Garantir que dotenv está carregado ANTES de ler as variáveis
import dotenv from 'dotenv';
dotenv.config();

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN && SENTRY_DSN.trim() !== '') {
  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        nodeProfilingIntegration(),
      ],
      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
      // Setting this option to true will send default PII data to Sentry.
      // For example, automatic IP address collection on events
      sendDefaultPii: true,
      // Performance Monitoring
      profilesSampleRate: 1.0, // Profiling sample rate is relative to tracesSampleRate
    });
    console.log('✅ Sentry inicializado com sucesso');
  } catch (error) {
    console.warn('⚠️  Erro ao inicializar Sentry:', error.message);
  }
} else {
  console.warn('⚠️  SENTRY_DSN não configurado. Sentry desativado.');
}

// Exportar Sentry para uso em outras partes da aplicação
export { Sentry };
