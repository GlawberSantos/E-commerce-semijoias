import dotenv from 'dotenv';
dotenv.config();

// ✅ Pegando CLIENT_ID e CLIENT_SECRET do .env
const CLIENT_ID = process.env.MELHOR_ENVIO_CLIENT_ID;
const CLIENT_SECRET = process.env.MELHOR_ENVIO_CLIENT_SECRET;

async function getAccessToken() {
  // Validação
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Erro: CLIENT_ID e CLIENT_SECRET não configurados no .env');
    console.log('\n📝 Adicione no seu .env:');
    console.log('MELHOR_ENVIO_CLIENT_ID=seu_client_id_aqui');
    console.log('MELHOR_ENVIO_CLIENT_SECRET=seu_client_secret_aqui');
    console.log('\n🔗 Obtenha em: https://melhorenvio.com.br/painel/gerenciar/tokens');
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
      console.log('📋 Token:');
      console.log(data.access_token);
      console.log('\n📝 Adicione no seu .env:');
      console.log(`MELHOR_ENVIO_TOKEN=${data.access_token}`);
      console.log('\n⏰ Validade:', data.expires_in ? `${data.expires_in} segundos (${Math.floor(data.expires_in / 86400)} dias)` : 'Não especificada');
      console.log('🔄 Tipo:', data.token_type || 'Bearer');
    } else {
      console.error('❌ Erro ao gerar token:');
      console.error(JSON.stringify(data, null, 2));

      if (data.error === 'invalid_client') {
        console.log('\n💡 Dica: Verifique se CLIENT_ID e CLIENT_SECRET estão corretos');
      }
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

getAccessToken();