const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Güvenlik middleware'leri
app.use(helmet());
app.use(mongoSanitize());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100 // her IP için 15 dakikada maksimum 100 istek
});

app.use('/api/', limiter);

// CORS yapılandırması
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Klasör yapısını oluştur
const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(publicDir, 'uploads');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Statik dosya sunumu
app.use('/uploads', express.static(uploadsDir));

// Multer yapılandırması
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir.'));
    }
  }
});

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch((err) => console.error('MongoDB bağlantı hatası:', err));

// Veritabanı bağlantı hatası dinleyicisi
mongoose.connection.on('error', (err) => {
  console.error('MongoDB bağlantı hatası:', err);
});

// Veritabanı bağlantısı koptuğunda yeniden bağlanma
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB bağlantısı koptu, yeniden bağlanılıyor...');
  mongoose.connect(process.env.MONGODB_URI);
});

// User Model
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir email adresi giriniz']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  avatar: { 
    type: String,
    default: ''
  },
  bio: { 
    type: String,
    default: '',
    maxlength: 500
  },
  location: { 
    type: String,
    default: '',
    maxlength: 100
  },
  birthDate: { 
    type: Date
  },
  games: [{
    name: {
      type: String,
      required: true
    },
    platform: {
      type: String,
      required: true
    },
    favorite: {
      type: Boolean,
      default: false
    }
  }],
  interests: [{ 
    type: String,
    maxlength: 50
  }],
  socialLinks: {
    discord: {
      type: String,
      default: '',
      maxlength: 100
    },
    steam: {
      type: String,
      default: '',
      maxlength: 100
    },
    twitter: {
      type: String,
      default: '',
      maxlength: 100
    }
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  friendRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  sentFriendRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  notifications: [{
    type: {
      type: String,
      enum: ['friendRequest', 'friendAccept', 'like', 'comment']
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['online', 'offline', 'away', 'busy'],
    default: 'offline'
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    privateProfile: {
      type: Boolean,
      default: false
    },
    showOnlineStatus: {
      type: Boolean,
      default: true
    }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

// User model methods
userSchema.methods.isFriendWith = function(userId) {
  return this.friends.includes(userId);
};

userSchema.methods.hasPendingFriendRequest = function(userId) {
  return this.friendRequests.includes(userId);
};

userSchema.methods.hasSentFriendRequest = function(userId) {
  return this.sentFriendRequests.includes(userId);
};

userSchema.methods.addNotification = function(type, fromUser, post = null) {
  this.notifications.push({
    type,
    from: fromUser,
    post,
    read: false,
    createdAt: Date.now()
  });
  return this.save();
};

// Password hash middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Post Model
const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    default: '',
    maxlength: 1000
  },
  image: {
    type: String
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const Post = mongoose.model('Post', postSchema);

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token bulunamadı' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token süresi dolmuş' });
    }
    res.status(401).json({ message: 'Geçersiz token' });
  }
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Dosya boyutu çok büyük (max: 5MB)' });
    }
    return res.status(400).json({ message: 'Dosya yükleme hatası' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.code === 11000) {
    return res.status(400).json({ message: 'Bu değer zaten kullanımda' });
  }

  res.status(err.status || 500).json({ 
    message: err.message || 'Sunucu hatası'
  });
};

app.use(errorHandler);

// Routes
// Auth Routes
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Tüm alanları doldurunuz' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email veya kullanıcı adı zaten kullanımda' });
    }

    const user = new User({
      username,
      email,
      password
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
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email ve şifre gereklidir' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email veya şifre hatalı' });
    }

    const isValidPassword = await user.comparePassword(password);
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
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// Profile Routes
app.get('/api/users/profile/:userId', authMiddleware, async (req, res, next) => {
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

    const isFriend = req.user.friends.includes(user._id);
    const hasReceivedRequest = req.user.friendRequests.includes(user._id);
    const hasSentRequest = req.user.sentFriendRequests.includes(user._id);

    let friendshipStatus = 'none';
    if (isFriend) {
      friendshipStatus = 'friends';
    } else if (hasReceivedRequest) {
      friendshipStatus = 'pending_received';
    } else if (hasSentRequest) {
      friendshipStatus = 'pending_sent';
    }

    res.json({
      ...user.toObject(),
      posts,
      friendshipStatus
    });
  } catch (error) {
    next(error);
  }
});

// Profil güncelleme route'u
app.put('/api/users/profile/:userId', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Sadece kendi profilinizi güncelleyebilirsiniz' });
    }

    const {
      username,
      bio,
      location,
      birthDate,
      interests,
      socialLinks,
      settings
    } = req.body;

    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanımda' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          username: username || req.user.username,
          bio: bio || '',
          location: location || '',
          birthDate: birthDate || null,
          interests: interests || [],
          socialLinks: {
            discord: socialLinks?.discord || '',
            steam: socialLinks?.steam || '',
            twitter: socialLinks?.twitter || ''
          },
          settings: {
            ...req.user.settings,
            ...settings
          }
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Avatar yükleme route'u
app.post('/api/users/avatar', authMiddleware, upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Dosya yüklenmedi' });
    }

    const user = await User.findById(req.user._id);
    
    if (user.avatar) {
      const oldAvatarPath = path.join(uploadsDir, path.basename(user.avatar));
      try {
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      } catch (err) {
        console.error('Eski avatar silme hatası:', err);
      }
    }

    const fileName = `avatar-${user._id}-${Date.now()}${path.extname(req.file.originalname)}`;
    const filePath = path.join(uploadsDir, fileName);

    await sharp(req.file.buffer)
      .resize(200, 200)
      .jpeg({ quality: 90 })
      .toFile(filePath);

    const avatarUrl = `/uploads/${fileName}`;
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      message: 'Avatar başarıyla güncellendi',
      avatar: avatarUrl
    });
  } catch (error) {
    next(error);
  }
});

// Friend Routes
app.post('/api/users/friend-request/:userId', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user._id;

    if (userId === requesterId.toString()) {
      return res.status(400).json({ message: 'Kendinize arkadaşlık isteği gönderemezsiniz' });
    }

    const targetUser = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!targetUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (requester.isFriendWith(userId)) {
      return res.status(400).json({ message: 'Bu kullanıcı zaten arkadaşınız' });
    }

    if (requester.hasSentFriendRequest(userId)) {
      return res.status(400).json({ message: 'Zaten bir arkadaşlık isteği gönderilmiş' });
    }

    targetUser.friendRequests.push(requesterId);
    requester.sentFriendRequests.push(userId);

    await targetUser.addNotification('friendRequest', requesterId);
    
    await targetUser.save();
    await requester.save();

    res.json({ message: 'Arkadaşlık isteği gönderildi' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/users/accept-friend/:userId', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const accepterId = req.user._id;

    const requester = await User.findById(userId);
    const accepter = await User.findById(accepterId);

    if (!requester || !accepter) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    accepter.friendRequests = accepter.friendRequests.filter(id => id.toString() !== userId);
    requester.sentFriendRequests = requester.sentFriendRequests.filter(id => id.toString() !== accepterId.toString());

    accepter.friends.push(userId);
    requester.friends.push(accepterId);

    await requester.addNotification('friendAccept', accepterId);

    await accepter.save();
    await requester.save();

    res.json({ message: 'Arkadaşlık isteği kabul edildi' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/users/reject-friend/:userId', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const rejecterId = req.user._id;

    const requester = await User.findById(userId);
    const rejecter = await User.findById(rejecterId);

    if (!requester || !rejecter) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    rejecter.friendRequests = rejecter.friendRequests.filter(
      id => id.toString() !== userId
    );
    requester.sentFriendRequests = requester.sentFriendRequests.filter(
      id => id.toString() !== rejecterId.toString()
    );

    await rejecter.save();
    await requester.save();

    res.json({ message: 'Arkadaşlık isteği reddedildi' });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/users/friends/:userId', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const removerId = req.user._id;

    const userToRemove = await User.findById(userId);
    const remover = await User.findById(removerId);

    if (!userToRemove || !remover) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    remover.friends = remover.friends.filter(
      id => id.toString() !== userId
    );
    userToRemove.friends = userToRemove.friends.filter(
      id => id.toString() !== removerId.toString()
    );

    await remover.save();
    await userToRemove.save();

    res.json({ message: 'Arkadaşlıktan çıkarıldı' });
  } catch (error) {
    next(error);
  }
});

// Post Routes
app.get('/api/posts', authMiddleware, async (req, res, next) => {
  try {
    const { sort = 'newest' } = req.query;
    
    let sortQuery = {};
    switch (sort) {
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'popular':
        sortQuery = { 'likes.length': -1 };
        break;
      case 'trending':
        sortQuery = { 'likes.length': -1, createdAt: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const posts = await Post.find()
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar')
      .sort(sortQuery)
      .lean(); // Performans için lean() kullan

    // Her zaman bir dizi döndür
    res.json(posts || []);
  } catch (error) {
    console.error('Post getirme hatası:', error);
    res.status(500).json({ message: 'Postlar getirilirken hata oluştu' });
  }
});

app.get('/api/posts', authMiddleware, async (req, res, next) => {
  try {
    const { sort = 'newest', page = 1, limit = 10 } = req.query;
    
    let sortQuery = {};
    switch (sort) {
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'popular':
        sortQuery = { 'likes.length': -1 };
        break;
      case 'trending':
        sortQuery = { 'likes.length': -1, createdAt: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar')
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit));

    const total = await Post.countDocuments();

    res.json({
      posts,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    next(error);
  }
});

app.put('/api/posts/:postId/like', authMiddleware, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post bulunamadı' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);
    
    if (likeIndex === -1) {
      post.likes.push(req.user._id);
      if (post.user.toString() !== req.user._id.toString()) {
        const postUser = await User.findById(post.user);
        await postUser.addNotification('like', req.user._id, post._id);
      }
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    await post.populate('user', 'username avatar');
    await post.populate('comments.user', 'username avatar');

    res.json(post);
  } catch (error) {
    next(error);
  }
});

// Comment Routes
app.post('/api/posts/:postId/comments', authMiddleware, async (req, res, next) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Yorum içeriği gereklidir' });
    }

    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post bulunamadı' });
    }

    post.comments.push({
      user: req.user._id,
      content,
      createdAt: new Date()
    });

    if (post.user.toString() !== req.user._id.toString()) {
      const postUser = await User.findById(post.user);
      await postUser.addNotification('comment', req.user._id, post._id);
    }

    await post.save();
    await post.populate('user', 'username avatar');
    await post.populate('comments.user', 'username avatar');

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/posts/:postId/comments/:commentId', authMiddleware, async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post bulunamadı' });
    }

    const commentIndex = post.comments.findIndex(
      comment => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }

    const comment = post.comments[commentIndex];
    const isCommentOwner = comment.user.toString() === req.user._id.toString();
    const isPostOwner = post.user.toString() === req.user._id.toString();

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();
    
    await post.populate('user', 'username avatar');
    await post.populate('comments.user', 'username avatar');

    res.json(post);
  } catch (error) {
    next(error);
  }
});

// Notification Routes
app.get('/api/users/notifications', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('notifications.from', 'username avatar')
      .populate('notifications.post', 'content');

    res.json(user.notifications);
  } catch (error) {
    next(error);
  }
});

app.put('/api/users/notifications/mark-read', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.notifications = user.notifications.map(notification => {
      notification.read = true;
      return notification;
    });

    await user.save();
    res.json({ message: 'Tüm bildirimler okundu olarak işaretlendi' });
  } catch (error) {
    next(error);
  }
});

// Search Route
app.get('/api/users/search', authMiddleware, async (req, res, next) => {
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
  } catch (error) {
    next(error);
  }
});

// Status Routes
app.put('/api/users/status', authMiddleware, async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['online', 'offline', 'away', 'busy'].includes(status)) {
      return res.status(400).json({ message: 'Geçersiz durum' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          status,
          lastActive: new Date()
        }
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Settings Routes
app.put('/api/users/settings', authMiddleware, async (req, res, next) => {
  try {
    const { emailNotifications, privateProfile, showOnlineStatus } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'settings.emailNotifications': emailNotifications,
          'settings.privateProfile': privateProfile,
          'settings.showOnlineStatus': showOnlineStatus
        }
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Game Management Routes
app.post('/api/users/games', authMiddleware, async (req, res, next) => {
  try {
    const { name, platform, favorite } = req.body;

    const user = await User.findById(req.user._id);
    
    // Oyun zaten ekli mi kontrol et
    const gameExists = user.games.some(game => 
      game.name.toLowerCase() === name.toLowerCase() && 
      game.platform.toLowerCase() === platform.toLowerCase()
    );

    if (gameExists) {
      return res.status(400).json({ message: 'Bu oyun zaten profilinize ekli' });
    }

    user.games.push({ name, platform, favorite });
    await user.save();

    res.json(user.games);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/users/games/:gameId', authMiddleware, async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const user = await User.findById(req.user._id);
    
    user.games = user.games.filter(game => game._id.toString() !== gameId);
    await user.save();

    res.json(user.games);
  } catch (error) {
    next(error);
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Hata:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Dosya boyutu çok büyük (max: 5MB)' });
    }
    return res.status(400).json({ message: 'Dosya yükleme hatası' });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Geçersiz ID formatı' });
  }

  if (err.code === 11000) {
    return res.status(400).json({ message: 'Bu değer zaten kullanımda' });
  }

  res.status(err.status || 500).json({ 
    message: err.message || 'Sunucu hatası'
  });
});

// 404 Handler
app.use('*', (req, res, next) => {
  res.status(404).json({ message: 'Sayfa bulunamadı' });
});

// Cleanup function
const cleanup = () => {
  mongoose.connection.close(() => {
    console.log('MongoDB bağlantısı kapatıldı');
    process.exit(0);
  });
};

// Graceful shutdown
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Server Start
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});

// WebSocket bağlantısı için HTTP sunucusunu dışa aktar
module.exports = server;