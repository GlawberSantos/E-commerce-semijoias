import { query, getClient } from '../db.js';
import { CustomError } from '../utils/CustomError.js';

const orderService = {
  /**
   * Creates a new order.
   * This function is complex and involves multiple database operations.
   * Ensure all queries are optimized and transactions are handled correctly.
   * @param {Object} orderData - Data for the new order.
   * @returns {Promise<Object>} - A promise that resolves to the created order.
   */
  async createOrder(orderData) {
    const { items, customerInfo, shippingMethod, paymentMethod, _couponCode, shippingCost = 0 } = orderData;

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

      // Discount calculation logic (assuming calculateDiscount is available)
      let discount = 0;
      let appliedCoupon = null;
      // if (couponCode) {
      //   try {
      //     const discountData = calculateDiscount(couponCode, calculatedSubtotal);
      //     discount = discountData.discount;
      //     appliedCoupon = discountData.coupon;
      //   } catch (couponErr) {
      //     throw couponErr;
      //   }
      // }

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
      
      return {
        orderId: orderId,
        orderNumber: orderNumber,
        status: 'pending',
        totalAmount: finalTotal,
        message: 'Pedido criado com sucesso'
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Fetches an order by its ID.
   * TODO: Optimize this query to fetch order details and items in a single query using JOINs.
   * @param {string} orderId - The ID of the order to fetch.
   * @returns {Promise<Object>} - A promise that resolves to the order object.
   */
  async getOrderById(orderId) {
    const orderResult = await query(
      `SELECT o.*, 
              c.first_name, c.last_name, c.email, c.phone, c.cpf_cnpj,
              a.cep, a.street, a.number, a.complement, a.neighborhood, a.city, a.state
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       LEFT JOIN addresses a ON o.shipping_address_id = a.id
       WHERE o.id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];

    const itemsResult = await query(
      `SELECT oi.*, p.image, p.category
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );
    order.items = itemsResult.rows;

    return order;
  },

  // TODO: Add more order-related functions (update, cancel, list orders) and optimize their queries.
};

export default orderService;
