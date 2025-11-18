import { query } from '../db.js';

const productService = {
  /**
   * Fetches products with optional category filtering.
   * TODO: Optimize this query if needed, e.g., by adding indexes or more specific WHERE clauses.
   * @param {string} category - Optional category to filter products.
   * @returns {Promise<Array>} - A promise that resolves to an array of products.
   */
  async getProducts(category) {
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
    return result.rows;
  },

  /**
   * Fetches a single product by ID.
   * TODO: Optimize this query if needed.
   * @param {string} id - The ID of the product to fetch.
   * @returns {Promise<Object>} - A promise that resolves to a single product object.
   */
  async getProductById(id) {
    const result = await query(
      `SELECT id, name, price, price_discount, image, category, 
              material, color, style, occasion, stock, description
       FROM products 
       WHERE id = $1 AND active = true`,
      [id]
    );
    return result.rows[0];
  },

  /**
   * Searches for products by a search term.
   * TODO: Consider full-text search for better performance on large datasets.
   * @param {string} searchTerm - The term to search for.
   * @returns {Promise<Array>} - A promise that resolves to an array of matching products.
   */
  async searchProducts(searchTerm) {
    const result = await query(
      `SELECT id, name, price, price_discount, image, category, 
              material, color, style, occasion, stock, description
       FROM products 
       WHERE (name ILIKE $1 OR description ILIKE $1) AND active = true
       LIMIT 50`,
      [`%${searchTerm}%`]
    );
    return result.rows;
  },

  // TODO: Add more product-related functions (create, update, delete) and optimize their queries.
};

export default productService;
