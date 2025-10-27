import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Construir connectionString a partir de DATABASE_URL ou variáveis individuais
const connectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || process.env.PGUSER}:${process.env.DB_PASSWORD || process.env.PGPASSWORD}@${process.env.DB_HOST || process.env.PGHOST}:${process.env.DB_PORT || process.env.PGPORT || 5432}/${process.env.DB_NAME || process.env.PGDATABASE}`;

const pool = new Pool({
  connectionString,
  ssl: false, // Railway não precisa de SSL entre containers
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Log de configuração (sem mostrar senha)
console.log('🔧 Configuração do banco:', {
  host: process.env.DB_HOST || process.env.PGHOST || 'via DATABASE_URL',
  port: process.env.DB_PORT || process.env.PGPORT || 5432,
  database: process.env.DB_NAME || process.env.PGDATABASE || 'via DATABASE_URL',
  user: process.env.DB_USER || process.env.PGUSER || 'via DATABASE_URL'
});

// Eventos do pool
pool.on('connect', () => {
  console.log('✅ Nova conexão estabelecida com PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool do PostgreSQL:', err);
  process.exit(-1);
});

// Testar conexão imediatamente
(async () => {
  let retries = 10;
  while (retries > 0) {
    try {
      const result = await pool.query('SELECT NOW() as now, current_database() as db, current_user as user');
      console.log('✅ Conexão com banco estabelecida!');
      console.log('📦 Banco:', result.rows[0].db);
      console.log('👤 Usuário:', result.rows[0].user);
      console.log('⏰ Timestamp:', result.rows[0].now);
      break;
    } catch (error) {
      retries--;
      console.log(`⏳ Tentativa ${10 - retries}/10: Aguardando banco de dados...`);
      console.error('   Erro:', error.message);

      if (retries === 0) {
        console.error('❌ Falha ao conectar ao banco após 10 tentativas');
        console.error('🔍 Verifique se:');
        console.error('   1. O serviço PostgreSQL está rodando');
        console.error('   2. As credenciais estão corretas');
        console.error('   3. A variável DATABASE_URL está configurada no Railway');
        process.exit(-1);
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
})();

// Função helper para queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`✅ Query executada em ${duration}ms (${res.rowCount} linhas)`);
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

export default pool;