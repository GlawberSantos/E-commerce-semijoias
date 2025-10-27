import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const ORIGIN_CEP = '56318620'; // Petrolina, PE
const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN;

export async function calculateShipping({
  cepDestino,
  pesoTotal = 1.0,
  comprimento = 20.0,
  largura = 15.0,
  altura = 10.0
}) {
  try {
    // Validar token
    if (!MELHOR_ENVIO_TOKEN) {
      console.warn('⚠️ Token do Melhor Envio não configurado. Usando valores simulados.');
      return {
        pac: 15.0,
        sedex: 25.0,
        pickup: 0.0,
        simulated: true
      };
    }

    // Limpar CEPs
    const cleanCepDestino = cepDestino.replace(/\D/g, '');
    const cleanOriginCep = ORIGIN_CEP.replace(/\D/g, '');

    if (cleanCepDestino.length !== 8) {
      throw new Error('CEP de destino inválido. Deve conter 8 dígitos.');
    }

    // Garantir valores mínimos aceitos pela API
    const payload = {
      from: {
        postal_code: cleanOriginCep
      },
      to: {
        postal_code: cleanCepDestino
      },
      products: [
        {
          name: 'Produto Checkout',
          quantity: 1,
          weight: Math.max(0.3, pesoTotal), // Mínimo 300g
          height: Math.max(2, altura), // Mínimo 2cm
          width: Math.max(11, largura), // Mínimo 11cm
          length: Math.max(16, comprimento), // Mínimo 16cm
          insurance_value: 100.00
        }
      ],
      receipt: false,
      own_hand: false,
      platform: 'Gabrielly Semijoias E-commerce'
    };

    console.log('📦 Calculando frete:', {
      origem: cleanOriginCep,
      destino: cleanCepDestino,
      peso: payload.products[0].weight
    });

    const response = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MELHOR_ENVIO_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro API Melhor Envio:', response.status, errorText);

      if (response.status === 401) {
        console.error('🔑 Token do Melhor Envio inválido ou expirado');
      }

      throw new Error(`Erro ${response.status} ao calcular frete`);
    }

    const data = await response.json();
    console.log('✅ Resposta do Melhor Envio:', data.length, 'opções');

    const results = {
      pickup: 0.0 // Retirada grátis
    };

    if (Array.isArray(data)) {
      data.forEach(service => {
        if (service.error) {
          console.warn('⚠️ Serviço com erro:', service.name, service.error);
          return;
        }

        const name = service.name.toLowerCase();
        const price = parseFloat(service.price);

        if (name.includes('pac')) {
          results.pac = price;
        } else if (name.includes('sedex')) {
          results.sedex = price;
        }
      });
    }

    // Valores padrão caso não encontre
    return {
      pac: results.pac ?? 15.0,
      sedex: results.sedex ?? 25.0,
      pickup: 0.0
    };

  } catch (error) {
    console.error('❌ Erro ao calcular frete:', error.message);

    // Retornar valores padrão em caso de erro
    return {
      pac: 15.0,
      sedex: 25.0,
      pickup: 0.0,
      error: error.message,
      simulated: true
    };
  }
}