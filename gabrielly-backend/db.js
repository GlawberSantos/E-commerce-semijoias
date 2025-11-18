import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;

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
  console.log('✅ Nova conexão estabelecida com PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool do PostgreSQL:', err.message, err.code);
  // Não fazer exit aqui - apenas logar
});

export const query = (text, params) => pool.query(text, params);

export const getClient = () => pool.connect();

export const initializeDatabase = async () => {
  console.log('🔍 Verificando se o banco de dados precisa ser inicializado...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
    
  return new Promise((resolve, reject) => {
    try {
      console.log('Tentando conectar ao banco...');
      query(
        'SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = \'public\' AND tablename = \'products\''
      ).then((tableCheck) => {
        console.log('✅ Conexão bem-sucedida!');

        if (tableCheck.rowCount === 0) {
          console.log('⏳ Tabela "products" não encontrada. Inicializando o banco de dados...');
          const sqlFilePath = path.join(process.cwd(), 'init.sql');
          const initSql = fs.readFileSync(sqlFilePath, 'utf8');
          return pool.query(initSql).then(() => {
            console.log('✅ Banco de dados inicializado com sucesso a partir de init.sql!');
            resolve();
          });
        } else {
          console.log('👍 Banco de dados já está inicializado.');
          resolve();
        }
      }).catch((error) => {
        console.error('❌ Falha ao conectar:', error.message);
        console.error('Código do erro:', error.code);
        console.error('Stack:', error.stack);
        reject(error);
      });
    } catch (error) {
      console.error('❌ Falha catastrófica ao inicializar o banco de dados:', error.message);
      reject(error);
    }
  });
};

export default pool;