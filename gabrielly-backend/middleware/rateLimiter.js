import rateLimit from 'express-rate-limit';

const keyGenerator = (req) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (!ip) return 'unknown';
  // Strip port from IP address
  return ip.split(',')[0].split(':')[0];
};

// Generic rate limiter for most routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  keyGenerator,
});

// Specific rate limiters (customize as needed)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // e.g., 20 requests per 15 minutes for auth
  message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
  keyGenerator,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // e.g., 5 registration attempts per hour
  message: 'Too many registration attempts from this IP, please try again after an hour',
  keyGenerator,
});

const checkoutLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // e.g., 10 checkout attempts per 10 minutes
  message: 'Too many checkout attempts from this IP, please try again after 10 minutes',
  keyGenerator,
});

const chatbotLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // e.g., 30 requests per minute for chatbot
  message: 'Too many chatbot requests from this IP, please try again after a minute',
  keyGenerator,
});

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // e.g., 50 search requests per minute
  message: 'Too many search requests from this IP, please try again after a minute',
  keyGenerator,
});

const shippingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // e.g., 20 shipping calculation requests per minute
  message: 'Too many shipping calculation requests from this IP, please try again after a minute',
  keyGenerator,
});

const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // e.g., 100 requests per hour for admin routes
  message: 'Too many admin requests from this IP, please try again after an hour',
  keyGenerator,
});

const speedLimiter = rateLimit({
  windowMs: 1 * 1000, // 1 second
  max: 5, // e.g., 5 requests per second for general speed limiting
  message: 'Too many requests, slow down!',
  keyGenerator,
});

export {
  generalLimiter,
  authLimiter,
  registerLimiter,
  checkoutLimiter,
  chatbotLimiter,
  searchLimiter,
  shippingLimiter,
  adminLimiter,
  speedLimiter,
};