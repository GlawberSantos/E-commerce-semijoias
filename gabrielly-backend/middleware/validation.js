import { body, param, query, validationResult } from 'express-validator';

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Example validation chains
const registerValidation = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  handleValidationErrors,
];

const loginValidation = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const productValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  handleValidationErrors,
];

const productIdValidation = [
  param('id').isUUID().withMessage('Invalid product ID format'), // Assuming UUID for IDs
  handleValidationErrors,
];

const productSearchValidation = [
  query('q').notEmpty().withMessage('Search query cannot be empty'),
  handleValidationErrors,
];

const orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('customerInfo.email').isEmail().withMessage('Customer email is required and must be valid'),
  handleValidationErrors,
];

const orderIdValidation = [
  param('id').isUUID().withMessage('Invalid order ID format'),
  handleValidationErrors,
];

const chatValidation = [
  body('message').notEmpty().withMessage('Chat message cannot be empty'),
  handleValidationErrors,
];

const newsletterValidation = [
  body('email').isEmail().withMessage('Invalid email address for newsletter subscription'),
  handleValidationErrors,
];

const shippingValidation = [
  body('cepDestino').isLength({ min: 8, max: 8 }).withMessage('CEP must be 8 digits'),
  handleValidationErrors,
];

// Basic sanitization middleware (can be expanded)
const sanitizeSQL = (req, res, next) => {
  // Simple example: replace single quotes to prevent basic SQL injection
  // For more robust protection, consider a library like 'sqlstring' or parameterized queries
  for (const key in req.body) {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].replace(/'/g, '\'\'');
    }
  }
  for (const key in req.query) {
    if (typeof req.query[key] === 'string') {
      req.query[key] = req.query[key].replace(/'/g, '\'\'');
    }
  }
  for (const key in req.params) {
    if (typeof req.params[key] === 'string') {
      req.params[key] = req.params[key].replace(/'/g, '\'\'');
    }
  }
  next();
};

const stripHTML = (req, res, next) => {
  // Simple example: remove basic HTML tags
  // For more robust protection, consider a library like 'xss'
  const stripHtmlTags = (str) => {
    if (typeof str === 'string') {
      return str.replace(/<[^>]*>?/gm, '');
    }
    return str;
  };

  for (const key in req.body) {
    req.body[key] = stripHtmlTags(req.body[key]);
  }
  for (const key in req.query) {
    req.query[key] = stripHtmlTags(req.query[key]);
  }
  for (const key in req.params) {
    req.params[key] = stripHtmlTags(req.params[key]);
  }
  next();
};

export {
  registerValidation,
  loginValidation,
  productValidation,
  productIdValidation,
  productSearchValidation,
  orderValidation,
  orderIdValidation,
  chatValidation,
  newsletterValidation,
  shippingValidation,
  sanitizeSQL,
  stripHTML,
};
