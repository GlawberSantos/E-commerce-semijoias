import dotenv from 'dotenv';
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

dotenv.config();

// Pegando CLIENT_ID e CLIENT_SECRET do .env
const CLIENT_ID = process.env.MELHOR_ENVIO_CLIENT_ID;
const CLIENT_SECRET = process.env.MELHOR_ENVIO_CLIENT_SECRET;
const ENV_PATH = path.resolve(process.cwd(), '.env'); // caminho do seu .env

async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Erro: CLIENT_ID e CLIENT_SECRET não configurados no .env');
    return;
  }

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: 'cart-read cart-write companies-read companies-write coupons-read coupons-write notifications-read orders-read products-read products-write purchases-read shipping-calculate shipping-cancel shipping-checkout shipping-companies shipping-generate shipping-preview shipping-print shipping-share shipping-tracking ecommerce-shipping transactions-read'
  });

  try {
    console.log('🔄 Gerando token do Melhor Envio...\n');

    const response = await fetch('https://melhorenvio.com.br/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: params
    });

    const data = await response.json();

    if (data.access_token) {
      console.log('✅ Token gerado com sucesso!\n');
      console.log('📋 Token:', data.access_token);
      console.log('⏰ Validade:', data.expires_in ? `${data.expires_in} segundos (${Math.floor(data.expires_in / 86400)} dias)` : 'Não especificada');

      // Atualizando o .env automaticamente
      let envFile = fs.readFileSync(ENV_PATH, 'utf-8');

      if (envFile.includes('MELHOR_ENVIO_TOKEN=')) {
        // Substitui o token existente
        envFile = envFile.replace(/MELHOR_ENVIO_TOKEN=.*/g, `MELHOR_ENVIO_TOKEN=${data.access_token}`);
      } else {
        // Adiciona no final do arquivo
        envFile += `\nMELHOR_ENVIO_TOKEN=${data.access_token}\n`;
      }

      fs.writeFileSync(ENV_PATH, envFile);
      console.log('✅ .env atualizado com o novo MELHOR_ENVIO_TOKEN!\n');

    } else {
      console.error('❌ Erro ao gerar token:', JSON.stringify(data, null, 2));
      if (data.error === 'invalid_client') console.log('💡 Verifique CLIENT_ID e CLIENT_SECRET');
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

getAccessToken();
