import express from "express";
import cors from "cors";
import fs from "fs";

import dotenv from "dotenv";
dotenv.config();
import { query, getClient, initializeDatabase } from './db.js';
import { CustomError } from './utils/CustomError.js';
import { calculateDiscount } from './utils/couponLogic.js';
import { calculateShipping } from './utils/freteService.js';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Carregar dados de treinamento da Gaby
let gabyTrainingData = [];
try {
  const trainingData = fs.readFileSync('./gaby_training.json', 'utf-8');
  // Transformar para o formato de histórico do Gemini
  gabyTrainingData = JSON.parse(trainingData)
    .filter(item => item.user && item.bot) // Garante que ambos user e bot existam
    .map(item => ([
      { role: 'user', parts: [{ text: item.user }] },
      { role: 'model', parts: [{ text: item.bot }] }
    ])).flat();
  console.log('✅ Dados de treinamento da Gaby carregados.');
} catch (error) {
  console.warn('⚠️  Atenção: Não foi possível carregar o arquivo de treinamento gaby_training.json. O chatbot usará apenas o prompt do sistema.');
}

// Configuração do Mercado Pago
const mercadoPagoAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
let mercadoPagoClient = null;
let preferenceClient = null;
let paymentClient = null;

if (mercadoPagoAccessToken) {
  try {
    mercadoPagoClient = new MercadoPagoConfig({
      accessToken: mercadoPagoAccessToken,
      options: { timeout: 5000 }
    });
    preferenceClient = new Preference(mercadoPagoClient);
    paymentClient = new Payment(mercadoPagoClient);
    console.log('✅ Configuração do Mercado Pago carregada.');
  } catch (error) {
    console.error('❌ Erro ao configurar Mercado Pago:', error);
  }
} else {
  console.warn('⚠️  Atenção: O token de acesso do Mercado Pago (MERCADOPAGO_ACCESS_TOKEN) não foi encontrado no .env. A funcionalidade de pagamento não estará disponível.');
}

const app = express();

// ==================== CORS CONFIGURADO ====================
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5001',
    'http://192.168.15.45:5000',
    'http://localhost:5173',
    'https://gabriellysemijoias.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ==================== IA CONFIG ====================
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.GEMINI_API_KEY;
let genAI = null;
let generativeModel = null;

if (geminiApiKey) {
  try {
    genAI = new GoogleGenerativeAI(geminiApiKey);
    // A biblioteca oficial gerencia automaticamente a versão da API
    generativeModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log('✅ Configuração do Gemini AI carregada.');
  } catch (error) {
    console.error('❌ Erro ao configurar Gemini AI:', error);
  }
} else {
  console.warn('⚠️  Atenção: A chave da API do Gemini (GEMINI_API_KEY) não foi encontrada no .env. A funcionalidade de chatbot não estará disponível.');
}

// Remover a função callGeminiAPI pois vamos usar a biblioteca oficial

// ==================== HEALTH CHECK ====================
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "API Gabrielly Semijoias",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// ==================== ROTAS DE PRODUTOS ====================
app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query;
    let sql = `
      SELECT id, name, price, price_discount, image, category, 
             material, color, style, occasion, stock, description
      FROM products 
      WHERE active = true
    `;
    const params = [];

    if (category) {
      sql += ' AND category = $1';
      params.push(category);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar produtos' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, price, price_discount, image, category, 
              material, color, style, occasion, stock, description
       FROM products 
       WHERE id = $1 AND active = true`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro interno ao buscar produto' });
  }
});

app.post('/api/products', async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const {
      name, price, priceDiscount, image, category,
      material, color, style, occasion, stock, description
    } = req.body;

    const result = await client.query(
      `INSERT INTO products (
        name, price, price_discount, image, category,
        material, color, style, occasion, stock, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [name, price, priceDiscount, image, category,
        material, color, style, occasion, stock, description]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro interno ao criar produto' });
  } finally {
    client.release();
  }
});

app.put('/api/products/:id', async (req, res) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const {
      name, price, priceDiscount, image, category,
      material, color, style, occasion, stock, description
    } = req.body;

    const result = await client.query(
      `UPDATE products 
       SET name = $1, price = $2, price_discount = $3, image = $4, 
           category = $5, material = $6, color = $7, style = $8,
           occasion = $9, stock = $10, description = $11,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12 AND active = true
       RETURNING *`,
      [name, price, priceDiscount, image, category,
        material, color, style, occasion, stock, description,
        req.params.id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar produto' });
  } finally {
    client.release();
  }
});

// ==================== ENDPOINTS DE PEDIDOS ====================
app.post("/api/orders", async (req, res) => {
  const { items, customerInfo, shippingMethod, paymentMethod, totalAmount, couponCode, shippingCost = 0 } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Itens do pedido são obrigatórios" });
  }
  if (!customerInfo || !customerInfo.firstName || !customerInfo.email) {
    return res.status(400).json({ error: "Informações do cliente (nome/email) são obrigatórias" });
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    let calculatedSubtotal = 0;
    for (const item of items) {
      const productResult = await client.query(
        'SELECT id, name, stock, price FROM products WHERE id = $1 FOR UPDATE',
        [item.productId]
      );
      if (productResult.rows.length === 0) {
        throw new CustomError(`Produto ${item.productId} não encontrado`, 404);
      }
      const product = productResult.rows[0];
      if (product.stock < item.quantity) {
        throw new CustomError(`Estoque insuficiente para ${product.name}. Disponível: ${product.stock}`, 409);
      }
      calculatedSubtotal += (parseFloat(product.price) * item.quantity);
    }

    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      try {
        const discountData = calculateDiscount(couponCode, calculatedSubtotal);
        discount = discountData.discount;
        appliedCoupon = discountData.coupon;
      } catch (couponErr) {
        throw couponErr;
      }
    }

    const finalTotal = calculatedSubtotal - discount + shippingCost;

    let customerId;
    const firstName = customerInfo.firstName;
    const lastName = customerInfo.lastName || '';
    const customerResult = await client.query(
      'SELECT id FROM customers WHERE email = $1',
      [customerInfo.email]
    );
    if (customerResult.rows.length > 0) {
      customerId = customerResult.rows[0].id;
      await client.query(
        'UPDATE customers SET first_name = $1, last_name = $2, phone = $3, cpf_cnpj = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
        [firstName, lastName, customerInfo.phone, customerInfo.cpfCnpj, customerId]
      );
    } else {
      const newCustomer = await client.query(
        'INSERT INTO customers (first_name, last_name, email, phone, cpf_cnpj) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [firstName, lastName, customerInfo.email, customerInfo.phone, customerInfo.cpfCnpj]
      );
      customerId = newCustomer.rows[0].id;
    }

    let addressId = null;
    if (customerInfo.address) {
      const addr = customerInfo.address;
      const addressResult = await client.query(
        'INSERT INTO addresses (customer_id, cep, street, number, complement, neighborhood, city, state) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
        [customerId, addr.cep, addr.street, addr.number, addr.complement, addr.neighborhood, addr.city, addr.state]
      );
      addressId = addressResult.rows[0].id;
    }

    const orderNumber = `ORD-${Date.now()}`;
    const orderResult = await client.query(
      'INSERT INTO orders (order_number, customer_id, total_amount, discount, shipping_cost, payment_method, shipping_method, shipping_address_id, notes, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
      [orderNumber, customerId, finalTotal, discount, shippingCost, paymentMethod, shippingMethod, addressId, appliedCoupon ? `Cupom: ${appliedCoupon}` : null, 'pending']
    );
    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      const productResult = await client.query(
        'SELECT name, price, stock FROM products WHERE id = $1',
        [item.productId]
      );
      const product = productResult.rows[0];
      const unitPrice = parseFloat(product.price);
      const subtotalItem = item.quantity * unitPrice;

      await client.query(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5, $6)',
        [orderId, item.productId, product.name, item.quantity, unitPrice, subtotalItem]
      );

      const newStock = product.stock - item.quantity;
      await client.query(
        'UPDATE products SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newStock, item.productId]
      );
      await client.query(
        'INSERT INTO stock_history (product_id, order_id, quantity_change, previous_stock, new_stock, reason) VALUES ($1, $2, $3, $4, $5, $6)',
        [item.productId, orderId, -item.quantity, product.stock, newStock, 'order_created']
      );
    }

    await client.query('COMMIT');
    console.log(`✅ Pedido criado: ${orderNumber} (Total: R$${finalTotal.toFixed(2)})`);
    return res.status(201).json({
      orderId: orderId,
      orderNumber: orderNumber,
      status: 'pending',
      totalAmount: finalTotal,
      message: "Pedido criado com sucesso"
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Erro ao criar pedido:", err);

    if (err instanceof CustomError) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor ao criar pedido." });
  } finally {
    client.release();
  }
});

app.post("/api/orders/:id/confirm", async (req, res) => {
  const orderId = parseInt(req.params.id);
  try {
    const result = await query(
      'UPDATE orders SET status = $1, paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND status = $3 RETURNING order_number, status',
      ['paid', orderId, 'pending']
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pedido não encontrado ou já foi confirmado" });
    }
    console.log(`💰 Pedido confirmado: ${result.rows[0].order_number}`);
    return res.json({
      orderNumber: result.rows[0].order_number,
      status: result.rows[0].status,
      message: "Pagamento confirmado"
    });
  } catch (err) {
    console.error("Erro ao confirmar pedido:", err);
    return res.status(500).json({ error: "Erro ao confirmar pedido" });
  }
});

app.post("/api/orders/:id/cancel", async (req, res) => {
  const orderId = parseInt(req.params.id);
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      'SELECT order_number, status FROM orders WHERE id = $1',
      [orderId]
    );
    if (orderResult.rows.length === 0) {
      throw new Error("Pedido não encontrado");
    }
    const order = orderResult.rows[0];
    if (order.status === 'paid') {
      throw new Error("Pedido já foi pago e não pode ser cancelado");
    }
    if (order.status === 'cancelled') {
      throw new Error("Pedido já foi cancelado");
    }

    const itemsResult = await client.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
      [orderId]
    );

    for (const item of itemsResult.rows) {
      const productResult = await client.query(
        'SELECT stock FROM products WHERE id = $1',
        [item.product_id]
      );
      const currentStock = productResult.rows[0].stock;
      const newStock = currentStock + item.quantity;
      await client.query(
        'UPDATE products SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newStock, item.product_id]
      );
      await client.query(
        'INSERT INTO stock_history (product_id, order_id, quantity_change, previous_stock, new_stock, reason) VALUES ($1, $2, $3, $4, $5, $6)',
        [item.product_id, orderId, item.quantity, currentStock, newStock, 'order_cancelled']
      );
    }

    await client.query(
      'UPDATE orders SET status = $1, cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['cancelled', orderId]
    );
    await client.query('COMMIT');
    console.log(`❌ Pedido cancelado: ${order.order_number}`);
    return res.json({
      orderNumber: order.order_number,
      status: 'cancelled',
      message: "Pedido cancelado e estoque devolvido"
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Erro ao cancelar pedido:", err);
    return res.status(500).json({ error: err.message || "Erro ao cancelar pedido" });
  } finally {
    client.release();
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const result = await query(
      `SELECT o.*,
              c.first_name, c.last_name, c.email,
              COUNT(oi.id) as items_count
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       GROUP BY o.id, c.first_name, c.last_name, c.email
       ORDER BY o.created_at DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("Erro ao listar pedidos:", err);
    return res.status(500).json({ error: "Erro ao listar pedidos" });
  }
});

app.get("/api/orders/:id", async (req, res) => {
  const orderId = parseInt(req.params.id);
  try {
    const orderResult = await query(
      `SELECT o.*,
              c.first_name, c.last_name, c.email, c.phone, c.cpf_cnpj,
              a.cep, a.street, a.number, a.complement, a.neighborhood, a.city, a.state
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       LEFT JOIN addresses a ON o.shipping_address_id = a.id
       WHERE o.id = $1`,
      [orderId]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }
    const order = orderResult.rows[0];

    const itemsResult = await query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [orderId]
    );
    order.items = itemsResult.rows;
    return res.json(order);
  } catch (err) {
    console.error("Erro ao buscar pedido:", err);
    return res.status(500).json({ error: "Erro ao buscar pedido" });
  }
});

// ==================== ROTAS DE AUTENTICAÇÃO ====================
import authRoutes from './utils/authRoutes.js';
app.use('/api/auth', authRoutes);

// ==================== ENDPOINTS DE ESTATÍSTICAS ====================
app.get("/api/stats/low-stock", async (req, res) => {
  try {
    const result = await query('SELECT * FROM low_stock_products');
    return res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar produtos com baixo estoque:", err);
    return res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

app.get("/api/stats/sales", async (req, res) => {
  try {
    const result = await query('SELECT * FROM sales_summary LIMIT 10');
    return res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar resumo de vendas:", err);
    return res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

// ==================== CHATBOT ====================
app.post("/chat", async (req, res) => {
  const { message: userMessage, history: historyFromRequest } = req.body;

  if (!userMessage) {
    return res.status(400).json({ reply: "Envie uma mensagem válida!" });
  }
  if (!generativeModel) {
    return res.status(503).json({ reply: "Chatbot indisponível no momento." });
  }

  // Garante que o histórico seja sempre um array de objetos no formato correto e válido
  const history = (Array.isArray(historyFromRequest) ? historyFromRequest : [])
    .map(h => {
      // Garante que 'parts' seja um array e filtre partes inválidas
      if (!h || !h.role || !Array.isArray(h.parts)) {
        return null;
      }
      
      const validParts = h.parts.filter(p => p && typeof p.text === 'string' && p.text.trim() !== '');

      // Se não houver partes válidas, não inclua este item do histórico
      if (validParts.length === 0) {
        return null;
      }

      return {
        role: h.role,
        parts: validParts.map(p => ({ text: p.text })) // Mapeia para o formato correto
      };
    })
    .filter(Boolean); // Remove os itens nulos do histórico

  try {
    // 1. Pesquisar produtos relevantes no banco de dados
    const searchTerms = userMessage.split(/\s+/).filter(term => term.length > 2);
    let productContext = '';

    if (searchTerms.length > 0) {
      console.log('🤖 Termos de busca extraídos:', searchTerms);

      const conditions = [];
      const values = [];
      let paramIndex = 1;

      searchTerms.forEach(term => {
        conditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`);
        values.push(`%${term}%`);
        paramIndex++;
      });

      const productQuery = `
        SELECT id, name, price, description, stock 
        FROM products 
        WHERE active = true AND (${conditions.join(' OR ')}) 
        LIMIT 5`;

      console.log('🔍 Executando busca de produtos');
      const productsResult = await query(productQuery, values);
      console.log(`✅ Produtos encontrados: ${productsResult.rows.length}`);

      if (productsResult.rows.length > 0) {
        const frontendUrl = process.env.FRONTEND_URL || 'https://gabriellysemijoias.vercel.app';
        productContext = "\n\n--- Produtos Relevantes Encontrados ---\n";
        productsResult.rows.forEach(p => {
          const productUrl = `${frontendUrl}/produto/${p.id}`;
          productContext += `ID: ${p.id}, Nome: ${p.name}, Preço: R$${p.price}, Estoque: ${p.stock}, Descrição: ${p.description}, Link: ${productUrl}\n`;
        });
        productContext += "--- Fim dos Produtos ---\n";
      }
    } else {
      console.log('🤷 Nenhum termo de busca válido encontrado na mensagem do usuário.');
    }

    // 2. Montar o prompt e o histórico para a IA
    const systemInstruction = {
      role: "system",
      parts: [{
        text: `Você é Gaby, a assistente virtual da loja Gabrielly Semijoias 💎.
Seu objetivo é ajudar o cliente a encontrar produtos, esclarecer dúvidas sobre preços, frete, estoque e promoções — sempre de forma simpática, clara e natural.

REGRAS:
1. IMPORTANTE: Sempre que mencionar um produto, inclua o link completo no formato: ${process.env.FRONTEND_URL || 'https://gabriellysemijoias.vercel.app'}/catalogo/ID_DO_PRODUTO. Use o ID do produto fornecido no contexto.
2. Só se apresente uma vez por conversa.
3. Use linguagem simples e acolhedora, como se estivesse falando com um cliente real.
4. Se o usuário enviar um CEP (8 dígitos), oriente a usar o simulador de frete do site.
5. Responda sempre em português (Brasil).
6. Se não encontrar o produto exato, mas encontrar itens similares (ex: um brinco de coração quando o cliente pediu um colar de coração), sugira esses itens como alternativa. Diga algo como "Não encontrei exatamente um colar de coração, mas tenho esses brincos de coração que talvez você goste!".
7. Jamais invente informações sobre preços ou tempo de existência da loja.
8. Seja breve, natural e mantenha o tom feminino, simpático e profissional.`
      }]
    };

    const combinedHistory = [...gabyTrainingData, ...history];

    const chat = generativeModel.startChat({
      history: combinedHistory,
      generationConfig: {
        maxOutputTokens: 800,
      },
      systemInstruction: systemInstruction,
    });

    const result = await chat.sendMessage(userMessage + (productContext || ''));
    const response = await result.response;
    const text = response.text();

    return res.json({ reply: text });

  } catch (err) {
    console.error("Erro completo do Gemini:", err);
    return res.status(500).json({ reply: "Erro ao gerar resposta com o Gemini." });
  }
});

// ==================== NEWSLETTER ====================
app.post("/api/newsletter/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: "Por favor, forneça um e-mail válido." });
  }

  try {
    const existingSubscriber = await query(
      "SELECT email FROM newsletter_subscribers WHERE email = $1",
      [email]
    );

    if (existingSubscriber.rows.length > 0) {
      return res.status(409).json({ message: "Este e-mail já está cadastrado." });
    }

    await query(
      "INSERT INTO newsletter_subscribers (email) VALUES ($1)",
      [email]
    );

    console.log(`💌 Novo assinante da newsletter: ${email}`);
    res.status(201).json({ message: "Inscrição realizada com sucesso! Obrigado por se juntar a nós." });

  } catch (error) {
    console.error("Erro ao inscrever na newsletter:", error);
    res.status(500).json({ error: "Ocorreu um erro ao processar sua inscrição. Tente novamente mais tarde." });
  }
});

// ==================== ENDPOINT DE FRETE (MERCADO ENVIOS) ====================
app.post("/api/mercado-envios/calcular", async (req, res) => {
  try {
    const { cepDestino, pesoTotal, comprimento, largura, altura } = req.body;

    if (!cepDestino) {
      return res.status(400).json({ error: "CEP de destino é obrigatório" });
    }

    const CEP_ORIGEM = '56304000';

    const results = await calculateShipping({
      cepOrigem: CEP_ORIGEM,
      cepDestino,
      pesoTotal: pesoTotal || 1.0,
      comprimento: comprimento || 20.0,
      largura: largura || 15.0,
      altura: altura || 10.0
    });

    return res.json(results);

  } catch (err) {
    console.error("Erro ao calcular frete:", err);
    return res.status(500).json({
      error: "Erro ao calcular frete",
      message: err.message
    });
  }
});

// ==================== ENDPOINT DE PAGAMENTO COM MERCADO PAGO ====================
app.post("/api/mercadopago/create-preference", async (req, res) => {
  if (!preferenceClient) {
    return res.status(503).json({ error: "A funcionalidade de pagamento não está disponível no momento." });
  }

  try {
    const { items, payer, shipments, back_urls, external_reference } = req.body;

    const preferenceData = {
      items: items,
      payer: payer,
      back_urls: back_urls || {
        success: `${process.env.FRONTEND_URL || 'https://gabriellysemijoias.vercel.app'}/success`,
        failure: `${process.env.FRONTEND_URL || 'https://gabriellysemijoias.vercel.app'}/checkout`,
        pending: `${process.env.FRONTEND_URL || 'https://gabriellysemijoias.vercel.app'}/pending`,
      },
      auto_return: "approved",
      shipments: shipments,
      notification_url: `${process.env.BACKEND_URL || 'https://e-commerce-semijoias-production.up.railway.app'}/api/mercadopago/notification`,
      external_reference: external_reference,
    };

    const response = await preferenceClient.create({ body: preferenceData });
    res.json({
      id: response.id,
      init_point: response.init_point
    });

  } catch (error) {
    console.error('Erro ao criar preferência de pagamento:', error);
    res.status(500).json({
      error: "Erro ao processar pagamento",
      details: error.message
    });
  }
});

app.post("/api/mercadopago/create-payment", async (req, res) => {
  if (!paymentClient) {
    return res.status(503).json({ error: "A funcionalidade de pagamento não está disponível no momento." });
  }

  try {
    const { orderData, payment_method_id } = req.body;

    const paymentData = {
      transaction_amount: orderData.shipments.cost + orderData.items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0),
      description: `Pedido #${orderData.external_reference}`,
      payment_method_id: payment_method_id,
      payer: {
        email: orderData.payer.email,
        first_name: orderData.payer.name,
        last_name: orderData.payer.surname,
        identification: {
          type: orderData.payer.identification.type,
          number: orderData.payer.identification.number,
        },
      },
      external_reference: orderData.external_reference,
      notification_url: `${process.env.BACKEND_URL || 'https://e-commerce-semijoias-production.up.railway.app'}/api/mercadopago/notification`,
    };

    const response = await paymentClient.create({ body: paymentData });

    if (payment_method_id === 'pix') {
      res.json({
        payment_id: response.id,
        qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64,
        qr_code: response.point_of_interaction.transaction_data.qr_code,
      });
    } else if (payment_method_id === 'bolbradesco') {
      res.json({
        payment_id: response.id,
        boleto_url: response.point_of_interaction.transaction_data.ticket_url,
      });
    }

  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({
      error: "Erro ao processar pagamento",
      details: error.message
    });
  }
});

app.post("/api/mercadopago/notification", async (req, res) => {
  const { query: queryParams } = req;
  const topic = queryParams.topic || queryParams.type;

  console.log('🔔 Notificação do Mercado Pago recebida:', { topic, queryParams });

  if (topic === 'payment') {
    const paymentId = queryParams.id || queryParams['data.id'];
    console.log('🔍 Buscando pagamento:', paymentId);

    try {
      if (!paymentClient) {
        throw new Error('Cliente de pagamento não configurado');
      }

      const payment = await paymentClient.get({ id: Number(paymentId) });
      const paymentStatus = payment.status;
      const externalReference = payment.external_reference;

      console.log(`✨ Status do pagamento: ${paymentStatus}`);
      console.log(`📋 Referência externa: ${externalReference}`);

      if (paymentStatus === 'approved' && externalReference) {
        console.log(`🚀 Atualizando pedido ${externalReference} para PAGO`);

        const orderResult = await query(
          'SELECT id FROM orders WHERE order_number = $1',
          [externalReference]
        );

        if (orderResult.rows.length > 0) {
          const orderId = orderResult.rows[0].id;
          await query(
            'UPDATE orders SET status = $1, paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['paid', orderId]
          );
          console.log(`✅ Pedido ${externalReference} atualizado para PAGO`);
        }
      } else {
        console.log(`⏳ Pedido com status: ${paymentStatus}`);
      }
    } catch (error) {
      console.error('Erro ao processar notificação do Mercado Pago:', error);
    }
  }

  res.status(200).send('OK');
});

// ==================== INICIALIZAÇÃO DO SERVIDOR ====================
const PORT = process.env.PORT || 5000;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log("🔗 Endpoints disponíveis:");
    console.log(" GET  /");
    console.log(" GET  /health");
    console.log(" GET  /api/products");
    console.log(" GET  /api/products?category=brincos");
    console.log(" GET  /api/products/:id");
    console.log(" POST /api/products");
    console.log(" PUT  /api/products/:id");
    console.log(" POST /api/orders");
    console.log(" POST /api/orders/:id/confirm");
    console.log(" POST /api/orders/:id/cancel");
    console.log(" GET  /api/orders");
    console.log(" GET  /api/orders/:id");
    console.log(" GET  /api/stats/low-stock");
    console.log(" GET  /api/stats/sales");
    console.log(" POST /api/mercado-envios/calcular");
    console.log(" POST /chat");
    console.log(" POST /api/mercadopago/create-preference");
    console.log(" POST /api/mercadopago/notification");
    console.log(" POST /api/newsletter/subscribe");
  });
};

initializeDatabase()
  .then(() => {
    startServer();
  })
  .catch(err => {
    console.error("❌ Falha ao iniciar o servidor:", err);
    process.exit(1);
  });