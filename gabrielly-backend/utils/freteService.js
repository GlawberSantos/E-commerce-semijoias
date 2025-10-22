// utils/freteService.js
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// CEP de origem fixo (Petrolina, PE)
const ORIGIN_CEP = '56318620';
const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN;

/**
 * Calcula o frete usando a API do Melhor Envio
 * @param {Object} params - Parâmetros de cálculo
 * @param {string} params.cepDestino - CEP de destino
 * @param {number} params.pesoTotal - Peso total em kg
 * @param {number} params.comprimento - Comprimento em cm
 * @param {number} params.largura - Largura em cm
 * @param {number} params.altura - Altura em cm
 * @returns {Object} Preços por modalidade (pac, sedex, pickup)
 */
export async function calculateShipping({
  cepDestino,
  pesoTotal = 1.0,
  comprimento = 20.0,
  largura = 15.0,
  altura = 10.0
}) {
  try {
    // Verifica se o token está configurado
    if (!MELHOR_ENVIO_TOKEN) {
      console.warn('⚠️ Token do Melhor Envio não configurado. Retornando valores padrão.');
      return {
        pac: 15.0,
        sedex: 25.0,
        pickup: 0.0
      };
    }

    // Limpa o CEP (remove hífens, pontos, espaços)
    const cleanCepDestino = cepDestino.replace(/\D/g, '');
    const cleanOriginCep = ORIGIN_CEP.replace(/\D/g, '');

    // Validação
    if (!cleanCepDestino || cleanCepDestino.length !== 8) {
      throw new Error('CEP de destino inválido');
    }

    // Garantir que as dimensões sejam válidas
    const validWeight = Math.max(0.3, pesoTotal); // Peso mínimo 300g
    const validLength = Math.max(16, comprimento); // Mínimo 16cm
    const validWidth = Math.max(11, largura);     // Mínimo 11cm
    const validHeight = Math.max(2, altura);      // Mínimo 2cm

    // Monta o payload para o Melhor Envio
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
          weight: validWeight,
          height: validHeight,
          width: validWidth,
          length: validLength,
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
      peso: validWeight
    });

    // Faz a requisição para o Melhor Envio
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
      console.error('❌ Erro Melhor Envio:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });

      // Retorna valores padrão em caso de erro na API
      return {
        pac: 15.0,
        sedex: 25.0,
        pickup: 0.0,
        error: `Erro ao calcular frete: ${response.status}`
      };
    }

    const data = await response.json();
    console.log('✅ Resposta Melhor Envio:', JSON.stringify(data, null, 2));

    // Processa os resultados
    const results = {
      pickup: 0.0 // Retirada na loja sempre gratuita
    };

    if (Array.isArray(data)) {
      data.forEach(service => {
        // Ignora serviços com erro
        if (service.error) {
          console.warn(`⚠️ Serviço ${service.name} com erro:`, service.error);
          return;
        }

        if (service.price) {
          const serviceName = service.name.toLowerCase();
          const price = parseFloat(service.price);

          if (serviceName.includes('pac')) {
            results.pac = price;
          } else if (serviceName.includes('sedex')) {
            results.sedex = price;
          }
        }
      });
    }

    // Se nenhum serviço retornou preço, usa valores padrão
    if (!results.pac && !results.sedex) {
      console.warn('⚠️ Nenhum serviço retornou preço. Usando valores padrão.');
      results.pac = 15.0;
      results.sedex = 25.0;
    }

    return results;

  } catch (error) {
    console.error('❌ Erro ao calcular frete:', error.message);

    // Retorna valores padrão em caso de erro
    return {
      pac: 15.0,
      sedex: 25.0,
      pickup: 0.0,
      error: error.message
    };
  }
}

/**
 * Valida se um CEP é válido
 * @param {string} cep - CEP a ser validado
 * @returns {boolean} True se válido
 */
export function isValidCEP(cep) {
  if (!cep) return false;
  const cleanCep = cep.replace(/\D/g, '');
  return cleanCep.length === 8;
}

/**
 * Busca informações de endereço por CEP usando API ViaCEP
 * @param {string} cep - CEP a ser consultado
 * @returns {Object} Informações do endereço
 */
export async function getAddressByCEP(cep) {
  try {
    const cleanCep = cep.replace(/\D/g, '');

    if (!isValidCEP(cleanCep)) {
      throw new Error('CEP inválido');
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);

    if (!response.ok) {
      throw new Error('Erro ao buscar CEP');
    }

    const data = await response.json();

    if (data.erro) {
      throw new Error('CEP não encontrado');
    }

    return {
      cep: data.cep,
      street: data.logradouro,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf
    };
  } catch (error) {
    console.error('❌ Erro ao buscar CEP:', error);
    throw error;
  }
}