import { query } from './db.js';

const createNewsletterTable = async () => {
  try {
    console.log('Criando tabela newsletter_subscribers...');
    await query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela newsletter_subscribers criada com sucesso.');

    console.log('Criando índice para email...');
    await query('CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);');
    console.log('Índice criado com sucesso.');

  } catch (error) {
    console.error('Erro ao criar tabela de newsletter:', error);
  } finally {
    process.exit();
  }
};

createNewsletterTable();
