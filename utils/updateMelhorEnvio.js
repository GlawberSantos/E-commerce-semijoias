import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.MELHOR_ENVIO_CLIENT_ID;
const CLIENT_SECRET = process.env.MELHOR_ENVIO_CLIENT_SECRET;
const ENV_PATH = path.resolve(process.cwd(), '.env');

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ CLIENT_ID ou CLIENT_SECRET não configurados no .env');
  process.exit(1);
}

async function updateToken() {
  try {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: [
        'cart-read', 'cart-write', 'companies-read', 'companies-write',
        'coupons-read', 'coupons-write', 'notifications-read', 'orders-read',
        'products-read', 'products-write', 'purchases-read', 'shipping-calculate',
        'shipping-cancel', 'shipping-checkout', 'shipping-companies',
        'shipping-generate', 'shipping-preview', 'shipping-print', 'shipping-share',
        'shipping-tracking', 'ecommerce-shipping', 'transactions-read'
      ].join(' ')
    });

    const response = await fetch('https://melhorenvio.com.br/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    const data = await response.json();

    if (!data.access_token) throw new Error(JSON.stringify(data));

    let envFile = fs.readFileSync(ENV_PATH, 'utf8');

    if (envFile.includes('MELHOR_ENVIO_TOKEN=')) {
      envFile = envFile.replace(/MELHOR_ENVIO_TOKEN=.*/g, `MELHOR_ENVIO_TOKEN=${data.access_token}`);
    } else {
      envFile += `\nMELHOR_ENVIO_TOKEN=${data.access_token}\n`;
    }

    fs.writeFileSync(ENV_PATH, envFile, 'utf8');
    console.log('✅ MELHOR_ENVIO_TOKEN atualizado com sucesso no .env');

  } catch (err) {
    console.error('❌ Erro ao gerar token do Melhor Envio:', err.message);
  }
}

updateToken();
