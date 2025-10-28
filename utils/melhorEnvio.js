import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

let accessToken = process.env.MELHOR_ENVIO_TOKEN;
let expiresAt = 0; // timestamp em segundos

const CLIENT_ID = process.env.MELHOR_ENVIO_CLIENT_ID;
const CLIENT_SECRET = process.env.MELHOR_ENVIO_CLIENT_SECRET;

export async function getAccessToken() {
  const now = Date.now() / 1000;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.warn('⚠️ CLIENT_ID ou CLIENT_SECRET não configurados no .env');
    return null;
  }

  // Retorna token válido
  if (accessToken && now < expiresAt - 60) {
    return accessToken;
  }

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: 'cart-read cart-write companies-read companies-write coupons-read coupons-write notifications-read orders-read products-read products-write purchases-read shipping-calculate shipping-cancel shipping-checkout shipping-companies shipping-generate shipping-preview shipping-print shipping-share shipping-tracking ecommerce-shipping transactions-read'
  });

  try {
    const response = await fetch('https://melhorenvio.com.br/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: params
    });

    const data = await response.json();
    if (!data.access_token) throw new Error('Não foi possível gerar token do Melhor Envio');

    accessToken = data.access_token;
    expiresAt = now + (data.expires_in || 3600);
    console.log('✅ Token do Melhor Envio atualizado');

    return accessToken;

  } catch (err) {
    console.error('❌ Erro ao obter token do Melhor Envio:', err.message);
    return null;
  }
}
