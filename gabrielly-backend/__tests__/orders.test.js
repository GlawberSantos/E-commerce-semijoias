// gabrielly-backend/__tests__/orders.test.js
import request from 'supertest';
import express from 'express'; // Assuming your main app is exported from server.js
import { getClient, initializeDatabase } from '../db'; // Mock these for isolation
import orderService from '../services/orderService';
import { CustomError } from '../utils/CustomError';

// Mock database and order service for isolated testing
jest.mock('../db', () => ({
  getClient: jest.fn(),
  initializeDatabase: jest.fn(),
  query: jest.fn(),
}));
jest.mock('../services/orderService', () => ({
  createOrder: jest.fn(),
}));
jest.mock('../utils/CustomError', () => ({
  CustomError: jest.fn((message, status) => {
    const error = new Error(message);
    error.status = status;
    return error;
  }),
}));

// Create a dummy Express app for testing routes
const app = express();
app.use(express.json());

// Mock the order creation route (simplified for testing)
app.post('/api/orders', async (req, res) => {
  try {
    const order = await orderService.createOrder(req.body);
    res.status(201).json(order);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.status).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

describe('Order Integration Tests', () => {
  beforeAll(async () => {
    // Ensure database is initialized (mocked)
    await initializeDatabase();
  });

  beforeEach(() => {
    // Clear all mocks before each test
    orderService.createOrder.mockClear();
    getClient.mockClear();
    CustomError.mockClear();
  });

  it('should create an order successfully', async () => {
    const mockOrderData = {
      items: [{ productId: 'prod1', quantity: 1 }],
      customerInfo: { email: 'test@example.com', firstName: 'Test' },
      totalAmount: 100,
    };
    const mockCreatedOrder = {
      orderId: 'order123',
      orderNumber: 'ORD-123',
      status: 'pending',
      totalAmount: 100,
      message: 'Pedido criado com sucesso',
    };

    orderService.createOrder.mockResolvedValue(mockCreatedOrder);

    const res = await request(app)
      .post('/api/orders')
      .send(mockOrderData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual(mockCreatedOrder);
    expect(orderService.createOrder).toHaveBeenCalledTimes(1);
    expect(orderService.createOrder).toHaveBeenCalledWith(mockOrderData);
  });

  it('should return 400 if order data is invalid', async () => {
    const invalidOrderData = {
      items: [], // Empty items array
      customerInfo: { email: 'invalid-email', firstName: 'Test' },
      totalAmount: 100,
    };

    // Mock CustomError for validation errors (if your validation middleware throws it)
    // For this example, we'll assume the route handler catches it.
    orderService.createOrder.mockRejectedValue(new CustomError('Invalid order data', 400));

    const res = await request(app)
      .post('/api/orders')
      .send(invalidOrderData);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Invalid order data');
    expect(orderService.createOrder).toHaveBeenCalledTimes(1);
  });

  it('should return 500 for internal server errors', async () => {
    orderService.createOrder.mockRejectedValue(new Error('Database connection failed'));

    const res = await request(app)
      .post('/api/orders')
      .send({
        items: [{ productId: 'prod1', quantity: 1 }],
        customerInfo: { email: 'test@example.com', firstName: 'Test' },
        totalAmount: 100,
      });

    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('error', 'Internal server error');
    expect(orderService.createOrder).toHaveBeenCalledTimes(1);
  });
});
