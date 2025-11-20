import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import logger from './utils/logger.js'; // Importar o logger

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

const connectionOptions = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: false,
    };

const pool = new Pool(connectionOptions);

pool.on('connect', () => {
  logger.info('✅ Nova conexão estabelecida com PostgreSQL');
});

pool.on('error', (err) => {
  logger.error({ err }, '❌ Erro inesperado no pool do PostgreSQL: %s', err.message);
});

export const query = (text, params) => pool.query(text, params);

export const getClient = () => pool.connect();

export const initializeDatabase = async () => {
  logger.info('🔍 Verificando se o banco de dados precisa ser inicializado...');
  logger.info(`DATABASE_URL: ${process.env.DATABASE_URL ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}`);

  return new Promise((resolve, reject) => {
    try {
      logger.info('Tentando conectar ao banco...');
      query(
        'SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = \'public\' AND tablename = \'products\'
      ).then((tableCheck) => {
        logger.info('✅ Conexão bem-sucedida!');

        if (tableCheck.rowCount === 0) {
          logger.info('⏳ Tabela "products" não encontrada. Inicializando o banco de dados...');
          const sqlFilePath = path.join(process.cwd(), 'init.sql');
          const initSql = fs.readFileSync(sqlFilePath, 'utf8');
          return pool.query(initSql).then(() => {
            logger.info('✅ Banco de dados inicializado com sucesso a partir de init.sql!');
            resolve();
          });
        } else {
          logger.info('👍 Banco de dados já está inicializado.');
          resolve();
        }
      }).catch((error) => {
        logger.error({ error }, '❌ Falha ao conectar ao banco de dados: %s', error.message);
        reject(error);
      });
    } catch (error) {
      logger.error({ error }, '❌ Falha catastrófica ao inicializar o banco de dados: %s', error.message);
      reject(error);
    }
  });
};

export default pool;
