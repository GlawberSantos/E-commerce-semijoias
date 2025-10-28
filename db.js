import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('✅ Nova conexão estabelecida com PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool do PostgreSQL:', err);
  process.exit(-1);
});

export const query = (text, params) => pool.query(text, params);

export const getClient = () => pool.connect();

export const initializeDatabase = async () => {
    console.log('🔍 Verificando se o banco de dados precisa ser inicializado...');
    try {
        const tableCheck = await query(
            "SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'products'"
        );

        if (tableCheck.rowCount === 0) {
            console.log('⏳ Tabela "products" não encontrada. Inicializando o banco de dados...');
            const sqlFilePath = path.join(process.cwd(), 'init.sql');
            const initSql = fs.readFileSync(sqlFilePath, 'utf8');
            await pool.query(initSql);
            console.log('✅ Banco de dados inicializado com sucesso a partir de init.sql!');
        } else {
            console.log('👍 Banco de dados já está inicializado.');
        }
    } catch (error) {
        console.error('❌ Falha catastrófica ao inicializar o banco de dados:', error);
        process.exit(1);
    }
};

export default pool;