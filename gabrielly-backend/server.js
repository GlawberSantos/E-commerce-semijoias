// server.js - VERSÃO OTIMIZADA E SEGURA
// 🚀 Pronto para Black Friday

// IMPORTANTE: Importar instrument.js no TOPO do arquivo
import './instrument.js';

// Importar Sentry (já inicializado em instrument.js)
import * as Sentry from '@sentry/node';

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import helmet from 'helmet'; // NOVO: Segurança HTTP
import compression from 'compression'; // NOVO: Compressão GZIP

import dotenv from 'dotenv';
dotenv.config();

import pino from 'pino';
import pinoHttp from 'pino-http';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty', // Use pino-pretty for development for human-readable logs
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

// ==================== EXPRESS APP ====================
const app = express();

// Trust the first proxy hop (e.g., Azure App Service) - MUST be set early
// This is crucial for rate limiting and getting the correct client IP
app.set('trust proxy', 1); // Use 1 to trust the first hop

// Pino HTTP logger
app.use(pinoHttp({ logger }));

// ==================== CORS RESTRITO - DEVE ESTAR PRIMEIRO! ====================
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
    'https://app-gabrielly-frontend-prod.azurewebsites.net',
    'https://gabriellysemijoias.com',
    'https://www.gabriellysemijoias.com'
  ]
  : [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:8000',
    'http://localhost:8080',
    'http://127.0.0.1:3000'
  ];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`⚠️ Origem bloqueada: ${origin}`);
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// The request handler must be the first middleware on the app (after CORS)
// Sentry apenas será ativo se SENTRY_DSN estiver configurado (inicializado em instrument.js)
try {
  if (Sentry && Sentry.Handlers && Sentry.Handlers.requestHandler) {
    app.use(Sentry.Handlers.requestHandler());
    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());
  }
} catch (error) {
  logger.warn('⚠️  Sentry middleware não disponível');
}

// ==================== SEGURANÇA - HELMET ====================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      scriptSrc: ['\'self\'', '\'unsafe-inline\'', 'https://www.mercadopago.com'],
      imgSrc: ['\'self\'', 'data:', 'https:'],
      connectSrc: ['\'self\'', 'https://api.mercadopago.com', 'https://app-gabrielly-backend-prod.azurewebsites.net'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// ==================== COMPRESSÃO GZIP ====================
app.use(compression());

app.use(express.json({ limit: '10mb' })); // Limite de payload

// ==================== SANITIZAÇÃO GLOBAL ====================
app.use(sanitizeSQL);
app.use(stripHTML);

// ==================== RATE LIMITING GLOBAL ====================
app.use('/api/', generalLimiter);
app.use('/api/', speedLimiter);

// ==================== LOGS DE REQUISIÇÃO ====================
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });

  next();
});

// ==================== GEMINI AI ====================
import { GoogleGenerativeAI } from '@google/generative-ai';

const geminiApiKey = process.env.GEMINI_API_KEY;
let genAI = null;
let generativeModel = null;

if (geminiApiKey) {
  try {
    genAI = new GoogleGenerativeAI(geminiApiKey);
    generativeModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    logger.info('✅ Gemini AI configurado.');
  } catch (error) {
    logger.error('❌ Erro ao configurar Gemini:', error);
  }
} else {
  logger.warn('⚠️  GEMINI_API_KEY não encontrado.');
}

// ==================== HEALTH CHECK ====================
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'API Gabrielly Semijoias',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    cache: cacheService.getCacheInfo()
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'API Gabrielly Semijoias está operacional',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==================== ROTAS DE PRODUTOS ====================

// GET /api/products - COM CACHE
app.get('/api/products', cacheService.cacheMiddleware(600), async (req, res) => {
  try {
    const { category } = req.query;

    // Tenta buscar do cache
    const cachedData = await cacheService.cacheProducts.getAll(category || 'all');
    if (cachedData) {
      return res.json(cachedData);
    }

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

    // DEBUG: Log para verificar o que o banco de dados está retornando
    logger.info({
      msg: 'Resultado da consulta de produtos',
      category: category,
      count: result.rows.length,
      rows: result.rows,
    });

    // Salva no cache
    await cacheService.cacheProducts.setAll(category || 'all', result.rows);

    res.json(result.rows);
  } catch (error) {
    logger.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar produtos' });
  }
});

// GET /api/products/search - COM VALIDAÇÃO E RATE LIMIT
app.get('/api/products/search',
  searchLimiter,
  productSearchValidation,
  async (req, res) => {
    try {
      const searchTerm = req.query.q;

      // Verifica cache de busca
      const cachedSearch = await cacheService.cacheSearch.get(searchTerm);
      if (cachedSearch) {
        return res.json(cachedSearch);
      }

      const result = await query(
        `SELECT id, name, price, price_discount, image, category, 
                material, color, style, occasion, stock, description
         FROM products 
         WHERE (name ILIKE $1 OR description ILIKE $1) AND active = true
         LIMIT 50`,
        [`%${searchTerm}%`]
      );

      // Salva busca no cache
      await cacheService.cacheSearch.set(searchTerm, result.rows);

      res.json(result.rows);
    } catch (error) {
      logger.error('Erro ao buscar produtos:', error);
      res.status(500).json({ error: 'Erro interno ao buscar produtos' });
    }
  }
);

// GET /api/products/:id - COM VALIDAÇÃO E CACHE
app.get('/api/products/:id',
  productIdValidation,
  cacheService.cacheMiddleware(600),
  async (req, res) => {
    try {
      // Verifica cache específico do produto
      const cachedProduct = await cacheService.cacheProducts.getOne(req.params.id);
      if (cachedProduct) {
        return res.json(cachedProduct);
      }

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

      // Salva no cache
      await cacheService.cacheProducts.setOne(req.params.id, result.rows[0]);

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      res.status(500).json({ error: 'Erro interno ao buscar produto' });
    }
  }
);

// POST /api/products - COM VALIDAÇÃO E RATE LIMIT
app.post('/api/products',
  adminLimiter,
  productValidation,
  async (req, res) => {
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

      // Invalida cache
      await cacheService.invalidateProduct(result.rows[0].id, category);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao criar produto:', error);
      res.status(500).json({ error: 'Erro interno ao criar produto' });
    } finally {
      client.release();
    }
  }
);

// PUT /api/products/:id - COM VALIDAÇÃO
app.put('/api/products/:id',
  adminLimiter,
  productIdValidation,
  productValidation,
  async (req, res) => {
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

      // Invalida cache
      await cacheService.invalidateProduct(req.params.id, category);

      res.json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao atualizar produto:', error);
      res.status(500).json({ error: 'Erro interno ao atualizar produto' });
    } finally {
      client.release();
    }
  }
);

// ==================== ENDPOINTS DE PEDIDOS ====================

// POST /api/orders - COM VALIDAÇÃO E RATE LIMIT
app.post('/api/orders',
  checkoutLimiter,
  async (req, res) => {
    const { items, customerInfo, shippingMethod, paymentMethod, couponCode, shippingCost = 0 } = req.body;

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

        // Invalida cache do produto
        await cacheService.invalidateStock(item.productId);
      }

      await client.query('COMMIT');

      // Invalida cache de pedidos
      await cacheService.invalidateOrder(orderId);

      logger.info(`✅ Pedido criado: ${orderNumber} (Total: R$${finalTotal.toFixed(2)})`);
      return res.status(201).json({
        orderId: orderId,
        orderNumber: orderNumber,
        status: 'pending',
        totalAmount: finalTotal,
        message: 'Pedido criado com sucesso'
      });
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error('Erro ao criar pedido:', err);

      if (err instanceof CustomError) {
        return res.status(err.status).json({ error: err.message });
      }
      return res.status(500).json({ error: 'Erro interno do servidor ao criar pedido.' });
    } finally {
      client.release();
    }
  }
);

// Demais rotas de pedidos (confirm, cancel, etc) - Adicionar validações conforme necessário
// ... (continuar com suas rotas existentes, adicionando validações)

// ==================== ROTAS DE AUTENTICAÇÃO ====================
import authRoutes from './utils/authRoutes.js';
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/auth', authRoutes);

// ==================== CHATBOT ====================
app.post('/chat',
  chatbotLimiter,
  chatValidation,
  async (req, res) => {
    const { message: userMessage, history: historyFromRequest } = req.body;

    if (!generativeModel) {
      return res.status(503).json({ reply: 'Chatbot indisponível no momento.' });
    }

    const history = (Array.isArray(historyFromRequest) ? historyFromRequest : [])
      .map(h => {
        if (!h || !h.role || !Array.isArray(h.parts)) {
          return null;
        }

        const validParts = h.parts.filter(p => p && typeof p.text === 'string' && p.text.trim() !== '');

        if (validParts.length === 0) {
          return null;
        }

        return {
          role: h.role,
          parts: validParts.map(p => ({ text: p.text }))
        };
      })
      .filter(Boolean);

    try {
      // 1. Pesquisar produtos relevantes no banco de dados
      const searchTerms = userMessage.split(/\s+/).filter(term => term.length > 2);
      let productContext = '';

      if (searchTerms.length > 0) {
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

        const productsResult = await query(productQuery, values);

        if (productsResult.rows.length > 0) {
          const frontendUrl = process.env.FRONTEND_URL || 'https://app-gabrielly-frontend-prod.azurewebsites.net';
          productContext = '\n\n--- Produtos Relevantes Encontrados ---\n';
          productsResult.rows.forEach(p => {
            const productUrl = `${frontendUrl}/produto/${p.id}`;
            productContext += `ID: ${p.id}, Nome: ${p.name}, Preço: R$${p.price}, Estoque: ${p.stock}, Descrição: ${p.description}, Link: ${productUrl}\n`;
          });
          productContext += '--- Fim dos Produtos ---\n';
        }
      }

      const systemInstruction = {
        role: 'system',
        parts: [{
          text: `Você é Gaby, a assistente virtual da loja Gabrielly Semijoias 💎.
Seu objetivo é ajudar o cliente a encontrar produtos, esclarecer dúvidas sobre preços, frete, estoque e promoções — sempre de forma simpática, clara e natural.

REGRAS:
1. IMPORTANTE: Sempre que mencionar um produto, inclua o link completo no formato: ${process.env.FRONTEND_URL || 'https://app-gabrielly-frontend-prod.azurewebsites.net'}/catalogo/ID_DO_PRODUTO. Use o ID do produto fornecido no contexto.
2. Só se apresente uma vez por conversa.
3. Use linguagem simples e acolhedora.
4. Se o usuário enviar um CEP (8 dígitos), oriente a usar o simulador de frete do site.
5. Responda sempre em português (Brasil).
6. Seja breve, natural e profissional.`
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
      logger.error('Erro completo do Gemini:', err);
      return res.status(500).json({ reply: 'Erro ao gerar resposta com o Gemini.' });
    }
  }
);

// ==================== NEWSLETTER ====================
app.post('/api/newsletter/subscribe',
  newsletterValidation,
  async (req, res) => {
    const { email } = req.body;

    try {
      const existingSubscriber = await query(
        'SELECT email FROM newsletter_subscribers WHERE email = $1',
        [email]
      );

      if (existingSubscriber.rows.length > 0) {
        return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
      }

      await query(
        'INSERT INTO newsletter_subscribers (email) VALUES ($1)',
        [email]
      );

      console.log(`💌 Novo assinante: ${email}`);
      res.status(201).json({ message: 'Inscrição realizada com sucesso!' });

    } catch (error) {
      logger.error('Erro ao inscrever na newsletter:', error);
      res.status(500).json({ error: 'Erro ao processar sua inscrição.' });
    }
  }
);

// ==================== FRETE ====================
app.post('/api/mercado-envios/calcular',
  shippingLimiter,
  shippingValidation,
  async (req, res) => {
    try {
      const { cepDestino, pesoTotal, comprimento, largura, altura } = req.body;

      // Verifica cache de frete
      const cachedShipping = await cacheService.cacheShipping.get(cepDestino);
      if (cachedShipping) {
        return res.json(cachedShipping);
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

      // Salva no cache
      await cacheService.cacheShipping.set(cepDestino, results);

      return res.json(results);

    } catch (err) {
      logger.error('Erro ao calcular frete:', err);
      return res.status(500).json({
        error: 'Erro ao calcular frete',
        message: err.message
      });
    }
  }
);

// ==================== MERCADO PAGO ====================
// (Manter suas rotas existentes do Mercado Pago)

// ==================== ERROR HANDLER GLOBAL ====================
// The error handler must be before any other error middleware and after all controllers
// Sentry error handler será ativo se SENTRY_DSN estiver configurado (inicializado em instrument.js)
try {
  if (Sentry && Sentry.Handlers && Sentry.Handlers.errorHandler) {
    app.use(Sentry.Handlers.errorHandler());
  }
} catch (error) {
  logger.warn('⚠️  Sentry error handler não disponível');
}

app.use((err, req, res, _next) => {
  logger.error('❌ Erro não tratado:', err);

  // Erro de CORS
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'Acesso negado',
      message: 'Origem não permitida'
    });
  }

  // Erro genérico
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ocorreu um erro inesperado'
  });
});

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// ==================== INICIALIZAÇÃO ====================
const PORT = process.env.PORT || 5000;

const startServer = () => {
  app.listen(PORT, () => {
    logger.info(`🚀 Servidor rodando na porta ${PORT}`);
    logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    logger.info('✅ Rate limiting ativo');
    logger.info('✅ Validação de inputs ativa');
    logger.info('✅ Cache ativo');
    logger.info('✅ Segurança HTTP ativa');
    logger.info('✅ Compressão GZIP ativa');
  });
};

// Tenta inicializar o banco de dados em todos os ambientes
logger.info('Iniciando sequência de inicialização do banco...');

initializeDatabase()
  .then(() => {
    logger.info('✅ Banco de dados pronto para conexões.');
    startServer();
  })
  .catch(err => {
    logger.error('❌ FALHA CRÍTICA: Não foi possível inicializar o banco de dados.', err);
    if (process.env.NODE_ENV === 'production') {
      logger.error('--- APLICAÇÃO SERÁ ENCERRADA ---');
      process.exit(1); // Em produção, falha o container se não conseguir conectar/inicializar o DB
    } else {
      logger.warn('⚠️  Aviso: Não foi possível conectar ao banco de dados. O servidor iniciará mesmo assim.');
      startServer(); // Em desenvolvimento, inicia mesmo sem DB
    }
  });