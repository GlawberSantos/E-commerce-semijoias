import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { Pool } = pg;

// Construir connectionString a partir de DATABASE_URL ou variáveis individuais
const connectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || process.env.PGUSER}:${process.env.DB_PASSWORD || process.env.PGPASSWORD}@${process.env.DB_HOST || process.env.PGHOST}:${process.env.DB_PORT || process.env.PGPORT || 5432}/${process.env.DB_NAME || process.env.PGDATABASE}`;

// Detectar se está no Railway (ou qualquer ambiente de produção)
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Log de configuração (sem mostrar senha)
console.log('🔧 Configuração do banco:', {
  host: process.env.DB_HOST || process.env.PGHOST || 'via DATABASE_URL',
  port: process.env.DB_PORT || process.env.PGPORT || 5432,
  database: process.env.DB_NAME || process.env.PGDATABASE || 'via DATABASE_URL',
  user: process.env.DB_USER || process.env.PGUSER || 'via DATABASE_URL',
  ssl: isProduction ? 'enabled (rejectUnauthorized: false)' : 'disabled',
  environment: process.env.NODE_ENV || 'development'
});

// Eventos do pool
pool.on('connect', () => {
  console.log('✅ Nova conexão estabelecida com PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool do PostgreSQL:', err);
  process.exit(-1);
});

// Função helper para queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // Evitar log excessivo para queries de inicialização
    if (!text.includes('pg_catalog.pg_tables')) {
        console.log(`✅ Query executada em ${duration}ms (${res.rowCount} linhas)`);
    }
    return res;
  } catch (error) {
    console.error('❌ Erro na query:', error.message);
    console.error('   SQL:', text.substring(0, 100) + '...');
    throw error;
  }
};

// Função para transações
export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);

  // Timeout para evitar conexões travadas
  const timeout = setTimeout(() => {
    console.error('⚠️ Cliente do banco não foi liberado após 10 segundos');
  }, 10000);

  client.release = () => {
    clearTimeout(timeout);
    client.removeAllListeners();
    release();
  };

  return { query, release: client.release };
};

// Função para inicializar o banco de dados
export const initializeDatabase = async () => {
    console.log('🔍 Verificando se o banco de dados precisa ser inicializado...');
    try {
        const tableCheck = await query(
            "SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'products'"
        );

        if (tableCheck.rowCount === 0) {
            console.log('⏳ Tabela "products" não encontrada. Inicializando o banco de dados...');
            
            // O __dirname não existe em ES Modules, então usamos import.meta.url
            const sqlFilePath = path.join(path.dirname(new URL(import.meta.url).pathname), 'init.sql');
            
            // Corrigir o caminho para ambientes Windows que podem adicionar uma / extra
            const correctedPath = process.platform === "win32" ? sqlFilePath.substring(1) : sqlFilePath;

            const initSql = fs.readFileSync(correctedPath, 'utf8');
            
            await pool.query(initSql);
            console.log('✅ Banco de dados inicializado com sucesso a partir de init.sql!');
        } else {
            console.log('👍 Banco de dados já está inicializado.');
        }
    } catch (error) {
        console.error('❌ Falha catastrófica ao inicializar o banco de dados:', error);
        // Sair do processo se a inicialização falhar, pois a aplicação não pode rodar
        process.exit(1);
    }
};


export default pool;
