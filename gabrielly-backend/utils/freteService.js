// utils/freteService.js
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// CEP de origem fixo
const ORIGIN_CEP = '56318620';
const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN;

export async function calculateShipping({
  cepDestino,
  pesoTotal = 1.0,
  comprimento = 20.0,
  largura = 15.0,
  altura = 10.0
}) {
  try {
    if (!MELHOR_ENVIO_TOKEN) {
      console.warn('⚠️ Token do Melhor Envio não configurado.');
      return { pac: 15.0, sedex: 25.0, pickup: 0.0 };
    }

    const cleanCepDestino = cepDestino.replace(/\D/g, '');
    const cleanOriginCep = ORIGIN_CEP.replace(/\D/g, '');

    if (cleanCepDestino.length !== 8) throw new Error('CEP de destino inválido');

    const payload = {
      from: { postal_code: cleanOriginCep },
      to: { postal_code: cleanCepDestino },
      products: [
        {
          name: 'Produto Checkout',
          quantity: 1,
          weight: Math.max(0.3, pesoTotal),
          height: Math.max(2, altura),
          width: Math.max(11, largura),
          length: Math.max(16, comprimento),
          insurance_value: 100.00
        }
      ],
      receipt: false,
      own_hand: false,
      platform: 'Gabrielly Semijoias E-commerce'
    };

    const response = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MELHOR_ENVIO_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`Erro API Melhor Envio: ${response.status}`);

    const data = await response.json();
    const results = { pickup: 0.0 };

    if (Array.isArray(data)) {
      data.forEach(service => {
        if (service.error) return;
        const name = service.name.toLowerCase();
        const price = parseFloat(service.price);
        if (name.includes('pac')) results.pac = price;
        if (name.includes('sedex')) results.sedex = price;
      });
    }

    return {
      pac: results.pac ?? 15.0,
      sedex: results.sedex ?? 25.0,
      pickup: 0.0
    };
  } catch (error) {
    console.error('❌ Erro ao calcular frete:', error.message);
    return { pac: 15.0, sedex: 25.0, pickup: 0.0, error: error.message };
  }
}
