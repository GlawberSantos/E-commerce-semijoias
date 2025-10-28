import { query } from './db.js';

const fixLastName = async () => {
  try {
    console.log('🔧 Tornando last_name opcional...');

    await query(`
            ALTER TABLE customers 
            ALTER COLUMN last_name DROP NOT NULL;
        `);

    console.log('✅ Campo last_name agora é opcional!');

    // Verificar
    const result = await query(`
            SELECT column_name, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'customers'
            ORDER BY ordinal_position
        `);

    console.log('\n📋 Estrutura da tabela customers:');
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.is_nullable === 'YES' ? 'OPCIONAL' : 'OBRIGATÓRIO'}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  process.exit(0);
};

fixLastName();