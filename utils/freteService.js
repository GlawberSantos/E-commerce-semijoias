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
      return [
        { name: 'PAC (Simulado)', price: 15.0, delivery_time: 7, simulated: true },
        { name: 'SEDEX (Simulado)', price: 25.0, delivery_time: 3, simulated: true },
        { name: 'Retirada na Loja', price: 0.0, delivery_time: 0, simulated: true }
      ];
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
      return [
        { name: 'PAC (Simulado - Erro API)', price: 15.0, delivery_time: 7, simulated: true },
        { name: 'SEDEX (Simulado - Erro API)', price: 25.0, delivery_time: 3, simulated: true },
        { name: 'Retirada na Loja', price: 0.0, delivery_time: 0, simulated: true }
      ];
    }

    const data = await response.json();
    const results = []; // Initialize as an array

    if (Array.isArray(data)) {
      data.forEach(service => {
        if (service.error) return;
        results.push({
          name: service.name,
          price: parseFloat(service.price),
          delivery_time: service.delivery_time
        });
      });
    }

    // Add pickup option
    results.push({
      name: 'Retirada na Loja',
      price: 0.0,
      delivery_time: 0 // Instant pickup
    });

    return results;

  } catch (err) {
    console.error('❌ Erro ao calcular frete:', err.message);
    return [
      { name: 'PAC (Simulado - Erro Geral)', price: 15.0, delivery_time: 7, simulated: true, error: err.message },
      { name: 'SEDEX (Simulado - Erro Geral)', price: 25.0, delivery_time: 3, simulated: true, error: err.message },
      { name: 'Retirada na Loja', price: 0.0, delivery_time: 0, simulated: true, error: err.message }
    ];
  }
}
