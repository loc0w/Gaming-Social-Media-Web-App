// routes/auth.js
const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Kayıt ol
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email veya kullanıcı adı zaten kullanımda' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Kayıt hatası:', err);
    res.status(500).json({ message: 'Kayıt işlemi başarısız oldu' });
  }
});

// Giriş yap
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email veya şifre hatalı' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Email veya şifre hatalı' });
    }

    user.status = 'online';
    user.lastActive = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Giriş hatası:', err);
    res.status(500).json({ message: 'Giriş işlemi başarısız oldu' });
  }
});

// Token kontrolü
router.get('/verify', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Token doğrulama hatası:', err);
    res.status(500).json({ message: 'Token doğrulama hatası' });
  }
});

// Çıkış yap
router.post('/logout', auth, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      status: 'offline',
      lastActive: new Date()
    });
    res.json({ message: 'Başarıyla çıkış yapıldı' });
  } catch (err) {
    console.error('Çıkış hatası:', err);
    res.status(500).json({ message: 'Çıkış işlemi başarısız oldu' });
  }
});

module.exports = router;