const router = require('express').Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Bildirimleri getir
router.get('/', auth, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'username avatar')
      .populate('post', 'content')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Bildirimi okundu olarak işaretle
router.put('/:id/read', auth, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tüm bildirimleri okundu olarak işaretle
router.put('/read-all', auth, async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    res.json({ message: 'Tüm bildirimler okundu olarak işaretlendi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;