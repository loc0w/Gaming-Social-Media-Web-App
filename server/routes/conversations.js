// routes/conversations.js
const router = require('express').Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Tüm konuşmaları getir
router.get('/', auth, async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
    .populate('participants', 'username avatar status lastActive')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'username avatar'
      }
    })
    .sort({ updatedAt: -1 });

    // Her konuşma için karşı tarafın bilgilerini ve okunmamış mesaj sayısını ekle
    const enhancedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== req.user._id.toString()
      );
      return {
        ...conv.toObject(),
        otherUser: otherParticipant,
        unreadCount: conv.unreadCounts.get(req.user._id.toString()) || 0
      };
    });

    res.json(enhancedConversations);
  } catch (err) {
    console.error('Konuşmaları getirme hatası:', err);
    res.status(500).json({ message: 'Konuşmalar getirilemedi' });
  }
});

// Yeni konuşma başlat veya var olanı getir
router.post('/', auth, async (req, res, next) => {
  try {
    const { recipientId } = req.body;

    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Kendinizle konuşma başlatamazsınız' });
    }

    // Kullanıcının varlığını kontrol et
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Mevcut konuşmayı kontrol et
    let conversation = await Conversation.findOne({
      participants: {
        $all: [req.user._id, recipientId]
      }
    })
    .populate('participants', 'username avatar status lastActive')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'username avatar'
      }
    });

    if (conversation) {
      const otherParticipant = conversation.participants.find(
        p => p._id.toString() !== req.user._id.toString()
      );
      return res.json({
        ...conversation.toObject(),
        otherUser: otherParticipant,
        unreadCount: conversation.unreadCounts.get(req.user._id.toString()) || 0
      });
    }

    // Yeni konuşma oluştur
    conversation = new Conversation({
      participants: [req.user._id, recipientId],
      unreadCounts: new Map([[recipientId, 0], [req.user._id.toString(), 0]])
    });

    await conversation.save();
    await conversation.populate('participants', 'username avatar status lastActive');

    const otherParticipant = conversation.participants.find(
      p => p._id.toString() !== req.user._id.toString()
    );

    res.status(201).json({
      ...conversation.toObject(),
      otherUser: otherParticipant,
      unreadCount: 0
    });
  } catch (err) {
    console.error('Konuşma başlatma hatası:', err);
    res.status(500).json({ message: 'Konuşma başlatılamadı' });
  }
});

// Konuşmayı sil
router.delete('/:conversationId', auth, async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Konuşma bulunamadı' });
    }

    // İlgili tüm mesajları sil
    await Message.deleteMany({ conversation: conversation._id });
    await conversation.remove();

    res.json({ message: 'Konuşma silindi' });
  } catch (err) {
    console.error('Konuşma silme hatası:', err);
    res.status(500).json({ message: 'Konuşma silinemedi' });
  }
});

module.exports = router;