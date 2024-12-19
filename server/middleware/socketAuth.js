// middleware/socketAuth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Yetkilendirme token\'ı bulunamadı'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new Error('Geçersiz token'));
    }

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Yetkilendirme başarısız'));
  }
};

module.exports = socketAuth;