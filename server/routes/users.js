// routes/users.js
const router = require('express').Router();
const User = require('../models/User');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

// Multer yapılandırması
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir.'));
    }
  }
});

// Profil getir
router.get('/profile/:userId', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('friends', 'username avatar status')
      .populate('friendRequests', 'username avatar')
      .populate('sentFriendRequests', 'username avatar');

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const posts = await Post.find({ user: user._id })
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar')
      .sort({ createdAt: -1 });

    res.json({
      ...user.toObject(),
      posts,
      isFriend: req.user.isFriendWith(user._id),
      hasSentRequest: req.user.hasSentFriendRequest(user._id),
      hasReceivedRequest: req.user.hasPendingFriendRequest(user._id)
    });
  } catch (err) {
    console.error('Profil getirme hatası:', err);
    res.status(500).json({ message: 'Profil bilgileri getirilemedi' });
  }
});

// routes/users.js devamı

// Profil güncelle
router.put('/profile', auth, async (req, res, next) => {
  try {
    const { bio, birthDate, location, interests, socialLinks, games, settings } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          bio,
          birthDate: birthDate || null,
          location,
          interests,
          socialLinks,
          games,
          settings,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    console.error('Profil güncelleme hatası:', err);
    res.status(500).json({ message: 'Profil güncellenemedi' });
  }
});

// Avatar yükle
router.post('/avatar', auth, upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Resim yüklenmedi' });
    }

    const fileName = `avatar-${req.user._id}-${Date.now()}.jpeg`;
    const filePath = path.join('public/uploads', fileName);

    await sharp(req.file.buffer)
      .resize(200, 200)
      .jpeg({ quality: 90 })
      .toFile(path.join(__dirname, '..', filePath));

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { avatar: `/uploads/${fileName}` } },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error('Avatar yükleme hatası:', err);
    res.status(500).json({ message: 'Avatar yüklenemedi' });
  }
});

// Arkadaşlık isteği gönder
router.post('/friend-request/:userId', auth, async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Kendinize arkadaşlık isteği gönderemezsiniz' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (req.user.friends.includes(userId)) {
      return res.status(400).json({ message: 'Bu kullanıcı zaten arkadaşınız' });
    }

    if (req.user.sentFriendRequests.includes(userId)) {
      return res.status(400).json({ message: 'Zaten arkadaşlık isteği gönderilmiş' });
    }

    targetUser.friendRequests.push(req.user._id);
    req.user.sentFriendRequests.push(userId);

    await targetUser.save();
    await req.user.save();

    // Bildirim gönder
    await targetUser.addNotification('friendRequest', req.user._id);

    res.json({ message: 'Arkadaşlık isteği gönderildi' });
  } catch (err) {
    console.error('Arkadaşlık isteği hatası:', err);
    res.status(500).json({ message: 'Arkadaşlık isteği gönderilemedi' });
  }
});

// Arkadaşlık isteğini kabul et
router.post('/accept-friend/:userId', auth, async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const requester = await User.findById(userId);
    if (!requester) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // İstekleri kaldır
    req.user.friendRequests = req.user.friendRequests.filter(id => id.toString() !== userId);
    requester.sentFriendRequests = requester.sentFriendRequests.filter(
      id => id.toString() !== req.user._id.toString()
    );

    // Arkadaş listelerine ekle
    req.user.friends.push(userId);
    requester.friends.push(req.user._id);

    await req.user.save();
    await requester.save();

    // Bildirim gönder
    await requester.addNotification('friendAccept', req.user._id);

    res.json({ message: 'Arkadaşlık isteği kabul edildi' });
  } catch (err) {
    console.error('Arkadaşlık kabul hatası:', err);
    res.status(500).json({ message: 'Arkadaşlık isteği kabul edilemedi' });
  }
});

// Arkadaşlık isteğini reddet
router.post('/reject-friend/:userId', auth, async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const requester = await User.findById(userId);
    if (!requester) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // İstekleri kaldır
    req.user.friendRequests = req.user.friendRequests.filter(id => id.toString() !== userId);
    requester.sentFriendRequests = requester.sentFriendRequests.filter(
      id => id.toString() !== req.user._id.toString()
    );

    await req.user.save();
    await requester.save();

    res.json({ message: 'Arkadaşlık isteği reddedildi' });
  } catch (err) {
    console.error('Arkadaşlık reddetme hatası:', err);
    res.status(500).json({ message: 'Arkadaşlık isteği reddedilemedi' });
  }
});

// Arkadaşlıktan çıkar
router.delete('/friend/:userId', auth, async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const friend = await User.findById(userId);
    if (!friend) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Arkadaş listelerinden çıkar
    req.user.friends = req.user.friends.filter(id => id.toString() !== userId);
    friend.friends = friend.friends.filter(id => id.toString() !== req.user._id.toString());

    await req.user.save();
    await friend.save();

    res.json({ message: 'Arkadaşlıktan çıkarıldı' });
  } catch (err) {
    console.error('Arkadaşlıktan çıkarma hatası:', err);
    res.status(500).json({ message: 'Arkadaşlıktan çıkarılamadı' });
  }
});

// Kullanıcı ara
router.get('/search', auth, async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Arama terimi gerekli' });
    }

    const users = await User.find({
      $or: [
        { username: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') }
      ]
    })
    .select('username avatar bio')
    .limit(10);

    res.json(users);
  } catch (err) {
    console.error('Kullanıcı arama hatası:', err);
    res.status(500).json({ message: 'Arama yapılamadı' });
  }
});

module.exports = router;