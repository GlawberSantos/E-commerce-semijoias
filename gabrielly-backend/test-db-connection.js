import pkg from 'pg';
const { Client } = pkg;

const connectionString = process.env.DATABASE_URL || 'postgresql://gabyadmin:GabriellyPass2025@psql-gabrielly-prod.postgres.database.azure.com:5432/gabrielly_db?sslmode=require';

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  // Adicionar timeout
  statement_timeout: 30000,
  query_timeout: 30000,
});

async function testConnection() {
  try {
    console.log('🔄 Conectando ao PostgreSQL Azure...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    // Testar uma query simples
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query executada:');
    console.log('   Hora do servidor:', result.rows[0].current_time);

    // Listar bancos de dados
    const dbResult = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
    console.log('✅ Bancos de dados:');
    dbResult.rows.forEach(db => {
      console.log(`   • ${db.datname}`);
    });

  } catch (error) {
    console.error('❌ Erro ao conectar:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('✅ Conexão fechada');
  }
}

testConnection();
