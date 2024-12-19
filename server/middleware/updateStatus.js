// middleware/updateStatus.js
const User = require('../models/User');

const updateStatus = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        lastActive: new Date()
      });
    }
    next();
  } catch (err) {
    console.error('Durum güncelleme hatası:', err);
    next();
  }
};

module.exports = updateStatus;