import { query } from './db.js';

const addPasswordColumn = async () => {
  try {
    console.log('🔧 Adicionando coluna password_hash...');

    await query(`
            ALTER TABLE customers 
            ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
        `);

    console.log('✅ Coluna password_hash adicionada com sucesso!');

    // Verificar
    const result = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'customers'
            ORDER BY ordinal_position
        `);

    console.log('\n📋 Colunas da tabela customers:');
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  process.exit(0);
};

addPasswordColumn();