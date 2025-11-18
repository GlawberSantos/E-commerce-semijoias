// gabrielly-backend/__tests__/products.test.js
import productService from '../services/productService';
import { query } from '../db'; // Assuming db.js exports a query function

// Mock the database query function
jest.mock('../db', () => ({
  query: jest.fn(),
}));

describe('Product Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    query.mockClear();
  });

  it('should fetch all products', async () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', price: 100 },
      { id: '2', name: 'Product 2', price: 200 },
    ];
    query.mockResolvedValueOnce({ rows: mockProducts });

    const products = await productService.getProducts();
    expect(products).toEqual(mockProducts);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('SELECT id, name, price'), []);
  });

  it('should fetch products by category', async () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', price: 100, category: 'rings' },
    ];
    query.mockResolvedValueOnce({ rows: mockProducts });

    const products = await productService.getProducts('rings');
    expect(products).toEqual(mockProducts);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('AND category = $1'), ['rings']);
  });

  it('should fetch a product by ID', async () => {
    const mockProduct = { id: '1', name: 'Product 1', price: 100 };
    query.mockResolvedValueOnce({ rows: [mockProduct] });

    const product = await productService.getProductById('1');
    expect(product).toEqual(mockProduct);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('WHERE id = $1'), ['1']);
  });

  it('should return undefined if product not found by ID', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    const product = await productService.getProductById('999');
    expect(product).toBeUndefined();
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('should search for products', async () => {
    const mockProducts = [
      { id: '1', name: 'Product A', description: 'Description A' },
    ];
    query.mockResolvedValueOnce({ rows: mockProducts });

    const products = await productService.searchProducts('Product A');
    expect(products).toEqual(mockProducts);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('(name ILIKE $1 OR description ILIKE $1)'), ['%Product A%']);
  });
});
