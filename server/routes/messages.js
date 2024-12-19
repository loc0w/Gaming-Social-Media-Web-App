// routes/messages.js
const router = require('express').Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Konuşmanın mesajlarını getir
router.get('/:conversationId', auth, async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Konuşma bulunamadı' });
    }

    const messages = await Message.find({
      conversation: req.params.conversationId
    })
    .populate('sender', 'username avatar')
    .sort({ createdAt: 1 });

    // Okunmamış mesajları okundu olarak işaretle
    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        sender: { $ne: req.user._id },
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    // Okunmamış mesaj sayısını sıfırla
    conversation.unreadCounts.set(req.user._id.toString(), 0);
    await conversation.save();

    res.json(messages);
  } catch (err) {
    console.error('Mesaj getirme hatası:', err);
    res.status(500).json({ message: 'Mesajlar getirilemedi' });
  }
});

// Yeni mesaj gönder
router.post('/', auth, async (req, res, next) => {
  try {
    const { conversationId, content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Mesaj içeriği boş olamaz' });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Konuşma bulunamadı' });
    }

    const newMessage = new Message({
      conversation: conversationId,
      sender: req.user._id,
      content: content.trim()
    });

    await newMessage.save();
    await newMessage.populate('sender', 'username avatar');

    // Karşı tarafın okunmamış mesaj sayısını artır
    const recipientId = conversation.participants.find(
      p => p.toString() !== req.user._id.toString()
    );
    const currentUnreadCount = conversation.unreadCounts.get(recipientId.toString()) || 0;
    conversation.unreadCounts.set(recipientId.toString(), currentUnreadCount + 1);

    // Son mesajı güncelle
    conversation.lastMessage = newMessage._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Karşı tarafa bildirim gönder
    const recipient = await User.findById(recipientId);
    await recipient.addNotification('message', req.user._id, conversation._id);

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Mesaj gönderme hatası:', err);
    res.status(500).json({ message: 'Mesaj gönderilemedi' });
  }
});

// Mesajları okundu olarak işaretle
router.put('/:conversationId/read', auth, async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Konuşma bulunamadı' });
    }

    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        sender: { $ne: req.user._id },
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    conversation.unreadCounts.set(req.user._id.toString(), 0);
    await conversation.save();

    res.json({ message: 'Mesajlar okundu olarak işaretlendi' });
  } catch (err) {
    console.error('Mesaj okuma hatası:', err);
    res.status(500).json({ message: 'Mesajlar işaretlenemedi' });
  }
});

module.exports = router;