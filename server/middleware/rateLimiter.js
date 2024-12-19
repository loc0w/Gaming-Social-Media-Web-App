// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına maksimum istek
  message: {
    message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin'
  }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 5, // IP başına maksimum başarısız giriş denemesi
  message: {
    message: 'Çok fazla başarısız giriş denemesi, lütfen daha sonra tekrar deneyin'
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};