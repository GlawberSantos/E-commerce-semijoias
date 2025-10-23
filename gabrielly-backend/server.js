import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";
import { query, getClient } from './db.js';
import { CustomError } from './utils/CustomError.js';
import { calculateDiscount } from './utils/couponLogic.js';
import { calculateShipping } from './utils/freteService.js';

dotenv.config();

const app = express();

// ==================== CORS CONFIGURADO ====================
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://gabriellysemiijoias.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ==================== OPENAI CONFIG ====================
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ A chave da API (OPENAI_API_KEY) não foi encontrada no arquivo .env.");
}
const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  baseURL: "https://openrouter.ai/api/v1"
}) : null;

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

// ==================== ROTA COMPATIBILIDADE (sem /api/) ====================
// Suporta chamadas diretas a /products (compatibilidade com versões antigas do frontend)
app.get("/products", async (req, res) => {
  const { category } = req.query;
  try {
    let sql = 'SELECT * FROM products WHERE active = TRUE';
    const params = [];
    if (category) {
      sql += ' AND category = $1';
      params.push(category);
    }
    sql += ' ORDER BY category, name';
    const result = await query(sql, params);
    console.log(`📦 GET /products${category ? `?category=${category}` : ''} - ${result.rows.length} produtos retornados`);
    return res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar produtos:", err);
    return res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

app.get("/products/:id", async (req, res) => {
  const productId = parseInt(req.params.id);
  try {
    const result = await query(
      'SELECT * FROM products WHERE id = $1 AND active = TRUE',
      [productId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    console.log(`📦 GET /products/${productId} - Produto encontrado`);
    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao buscar produto:", err);
    return res.status(500).json({ error: "Erro ao buscar produto" });
  }
});

// ==================== ENDPOINTS DE PRODUTOS (com /api/) ====================
// GET /api/products - Lista todos os produtos ou filtra por categoria
app.get("/api/products", async (req, res) => {
  const { category } = req.query;
  try {
    let sql = 'SELECT * FROM products WHERE active = TRUE';
    const params = [];
    if (category) {
      sql += ' AND category = $1';
      params.push(category);
    }
    sql += ' ORDER BY category, name';
    const result = await query(sql, params);
    return res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar produtos:", err);
    return res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

// GET /api/products/:id - Busca um produto específico
app.get("/api/products/:id", async (req, res) => {
  const productId = parseInt(req.params.id);
  try {
    const result = await query(
      'SELECT * FROM products WHERE id = $1 AND active = TRUE',
      [productId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao buscar produto:", err);
    return res.status(500).json({ error: "Erro ao buscar produto" });
  }
});

// ==================== ENDPOINTS DE PEDIDOS ====================
// POST /api/orders - Cria um novo pedido
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

// POST /api/orders/:id/confirm - Confirma pagamento do pedido
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

// POST /api/orders/:id/cancel - Cancela pedido e devolve estoque
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

// GET /api/orders - Lista todos os pedidos
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

// GET /api/orders/:id - Busca um pedido específico com detalhes
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

// ==================== ENDPOINTS DE ESTATÍSTICAS ====================
// GET /api/stats/low-stock - Produtos com baixo estoque
app.get("/api/stats/low-stock", async (req, res) => {
  try {
    const result = await query('SELECT * FROM low_stock_products');
    return res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar produtos com baixo estoque:", err);
    return res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

// GET /api/stats/sales - Resumo de vendas
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
  const message = req.body.message;
  if (!message) {
    return res.status(400).json({ reply: "Envie uma mensagem válida!" });
  }
  if (!openai) {
    return res.status(503).json({ reply: "Chatbot indisponível no momento." });
  }
  try {
    const response = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: message }],
      headers: {
        "HTTP-Referer": "https://gabrielly-semijoias.com"
      }
    });
    return res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error("Erro completo da OpenRouter:", err);
    if (err.response) {
      console.error("Status da resposta:", err.response.status);
      console.error("Dados da resposta:", err.response.data);
    }
    return res.status(500).json({ reply: "Erro ao gerar resposta com a OpenRouter." });
  }
});

// ==================== ENDPOINT DE FRETE ====================
app.post("/api/frete/calcular", async (req, res) => {
  try {
    const { cepDestino, pesoTotal, comprimento, largura, altura } = req.body;

    if (!cepDestino) {
      return res.status(400).json({ error: "CEP de destino é obrigatório" });
    }

    const results = await calculateShipping({
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

// ==================== SERVIDOR ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log("🔗 Endpoints disponíveis:");
  console.log(" GET  /");
  console.log(" GET  /health");
  console.log(" GET  /products (compatibilidade)");
  console.log(" GET  /products/:id (compatibilidade)");
  console.log(" GET  /api/products");
  console.log(" GET  /api/products?category=brincos");
  console.log(" GET  /api/products/:id");
  console.log(" POST /api/orders");
  console.log(" POST /api/orders/:id/confirm");
  console.log(" POST /api/orders/:id/cancel");
  console.log(" GET  /api/orders");
  console.log(" GET  /api/orders/:id");
  console.log(" GET  /api/stats/low-stock");
  console.log(" GET  /api/stats/sales");
  console.log(" POST /api/frete/calcular");
  console.log(" POST /chat");
});