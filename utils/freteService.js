import { getAccessToken } from './melhorEnvio.js';
import fetch from 'node-fetch';

const ORIGIN_CEP = '56318620'; // Petrolina, PE

export async function calculateShipping({
  cepDestino,
  pesoTotal = 1.0,
  comprimento = 20.0,
  largura = 15.0,
  altura = 10.0
}) {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.warn('⚠️ Token não disponível. Retornando frete simulado.');
      return { pac: 15.0, sedex: 25.0, pickup: 0.0, simulated: true };
    }

    const cleanCepDestino = cepDestino.replace(/\D/g, '');
    const cleanOriginCep = ORIGIN_CEP.replace(/\D/g, '');

    if (cleanCepDestino.length !== 8) throw new Error('CEP de destino inválido');

    const payload = {
      from: { postal_code: cleanOriginCep },
      to: { postal_code: cleanCepDestino },
      products: [{
        name: 'Produto Checkout',
        quantity: 1,
        weight: Math.max(0.3, pesoTotal),
        height: Math.max(2, altura),
        width: Math.max(11, largura),
        length: Math.max(16, comprimento),
        insurance_value: 100.00
      }],
      receipt: false,
      own_hand: false,
      platform: 'Gabrielly Semijoias E-commerce'
    };

    const response = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro API Melhor Envio:', response.status, errorText);
      return { pac: 15.0, sedex: 25.0, pickup: 0.0, simulated: true };
    }

    const data = await response.json();
    const results = { pickup: 0.0 }; // Retirada grátis

    if (Array.isArray(data)) {
      data.forEach(service => {
        if (service.error) return;
        const name = service.name.toLowerCase();
        const price = parseFloat(service.price);
        if (name.includes('pac')) results.pac = price;
        if (name.includes('sedex')) results.sedex = price;
      });
    }

    return { pac: results.pac ?? 15.0, sedex: results.sedex ?? 25.0, pickup: 0.0 };

  } catch (err) {
    console.error('❌ Erro ao calcular frete:', err.message);
    return { pac: 15.0, sedex: 25.0, pickup: 0.0, simulated: true, error: err.message };
  }
}
