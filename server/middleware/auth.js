// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Yetkilendirme token\'ı bulunamadı' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Geçersiz token' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Yetkilendirme hatası:', err);
    res.status(401).json({ message: 'Yetkilendirme başarısız' });
  }
};

module.exports = auth;