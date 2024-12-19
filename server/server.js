const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Uploads klasörünü oluştur
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)){
fs.mkdirSync(uploadDir, { recursive: true });
}

// Static dosya sunumu
app.use('/uploads', express.static('public/uploads'));

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

// User Model
const userSchema = new mongoose.Schema({
username: {
type: String,
required: true,
unique: true,
trim: true
},
email: {
type: String,
required: true,
unique: true,
trim: true
},
password: {
type: String,
required: true
},
avatar: {
type: String,
default: ''
},
bio: {
type: String,
default: ''
},
location: {
type: String,
default: ''
},
birthDate: {
type: Date
},
games: [{
name: String,
platform: String,
favorite: {
type: Boolean,
default: false
}
}],
interests: [{
type: String
}],
socialLinks: {
discord: {
type: String,
default: ''
},
steam: {
type: String,
default: ''
},
twitter: {
type: String,
default: ''
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
createdAt: {
type: Date,
default: Date.now
}
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
default: ''
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
content: String,
createdAt: {
type: Date,
default: Date.now
}
}],
createdAt: {
type: Date,
default: Date.now
}
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
req.user = await User.findById(decoded.userId);

if (!req.user) {
return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
}

next();
} catch (error) {
res.status(401).json({ message: 'Geçersiz token' });
}
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
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
avatar: user.avatar,
createdAt: user.createdAt
}
});
} catch (error) {
console.error('Kayıt hatası:', error);
res.status(500).json({ message: 'Sunucu hatası' });
}
});

app.post('/api/auth/login', async (req, res) => {
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

// Update user status to online
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
console.error('Login hatası:', error);
res.status(500).json({ message: 'Sunucu hatası' });
}
});

// User Routes
app.get('/api/users/profile/:userId', authMiddleware, async (req, res) => {
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
} catch (error) {
console.error('Profil getirme hatası:', error);
res.status(500).json({ message: 'Kullanıcı bilgileri getirilirken hata oluştu' });
}
});

app.put('/api/users/profile', authMiddleware, async (req, res) => {
try {
const { bio, birthDate, location, interests, socialLinks, games } = req.body;

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
updatedAt: new Date()
}
},
{ new: true }
).select('-password');

if (!updatedUser) {
return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
}

const posts = await Post.find({ user: updatedUser._id })
.populate('user', 'username avatar')
.populate('comments.user', 'username avatar')
.sort({ createdAt: -1 });

res.json({
...updatedUser.toObject(),
posts
});
} catch (error) {
console.error('Profil güncelleme hatası:', error);
res.status(500).json({ message: 'Profil güncellenirken hata oluştu' });
}
});

// Avatar yükleme route'u
app.post('/api/users/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
try {
if (!req.file) {
return res.status(400).json({ message: 'Dosya yüklenmedi' });
}

const fileName = `avatar-${req.user._id}-${Date.now()}${path.extname(req.file.originalname)}`;
const filePath = path.join('public/uploads', fileName);

await sharp(req.file.buffer)
.resize(200, 200)
.jpeg({ quality: 90 })
.toFile(path.join(__dirname, filePath));

const user = await User.findByIdAndUpdate(
req.user._id,
{ $set: { avatar: `/uploads/${fileName}` } },
{ new: true }
).select('-password');

res.json(user);
} catch (error) {
console.error('Avatar yükleme hatası:', error);
res.status(500).json({ message: 'Avatar yüklenirken hata oluştu' });
}
});

// Arkadaşlık istekleri route'ları
app.post('/api/users/friend-request/:userId', authMiddleware, async (req, res) => {
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
console.error('Arkadaşlık isteği hatası:', error);
res.status(500).json({ message: 'Arkadaşlık isteği gönderilirken bir hata oluştu' });
}
});

app.post('/api/users/accept-friend/:userId', authMiddleware, async (req, res) => {
try {
const { userId } = req.params;
const accepterId = req.user._id;

const requester = await User.findById(userId);
const accepter = await User.findById(accepterId);

if (!requester || !accepter) {
return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
}

// İsteği kaldır
accepter.friendRequests = accepter.friendRequests.filter(
id => id.toString() !== userId
);
requester.sentFriendRequests = requester.sentFriendRequests.filter(
id => id.toString() !== accepterId.toString()
);

// Arkadaş listelerine ekle
accepter.friends.push(userId);
requester.friends.push(accepterId);

// Bildirim ekle
await requester.addNotification('friendAccept', accepterId);

await accepter.save();
await requester.save();

res.json({ message: 'Arkadaşlık isteği kabul edildi' });
} catch (error) {
console.error('Arkadaşlık kabul hatası:', error);
res.status(500).json({ message: 'Arkadaşlık isteği kabul edilirken bir hata oluştu' });
}
});

app.post('/api/users/reject-friend/:userId', authMiddleware, async (req, res) => {
try {
const { userId } = req.params;
const rejecterId = req.user._id;

const rejecter = await User.findById(rejecterId);
const requester = await User.findById(userId);

if (!rejecter || !requester) {
return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
}

// İsteği kaldır
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
console.error('Arkadaşlık reddetme hatası:', error);
res.status(500).json({ message: 'Arkadaşlık isteği reddedilirken bir hata oluştu' });
}
});

app.get('/api/users/friend-requests', authMiddleware, async (req, res) => {
try {
const user = await User.findById(req.user._id)
.populate('friendRequests', 'username avatar');

res.json(user.friendRequests);
} catch (error) {
console.error('Arkadaşlık istekleri getirme hatası:', error);
res.status(500).json({ message: 'Arkadaşlık istekleri getirilirken bir hata oluştu' });
}
});

// Post Routes
app.get('/api/posts', authMiddleware, async (req, res) => {
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
.sort(sortQuery);

res.json(posts);
} catch (error) {
console.error('Post getirme hatası:', error);
res.status(500).json({ message: 'Postlar getirilirken hata oluştu' });
}
});

app.post('/api/posts', authMiddleware, upload.single('image'), async (req, res) => {
try {
const { content } = req.body;

if (!content && !req.file) {
return res.status(400).json({ message: 'Gönderi içeriği veya resim gereklidir' });
}

let imageUrl = null;

if (req.file) {
const fileName = `post-${Date.now()}${path.extname(req.file.originalname)}`;
const imagePath = path.join('public/uploads', fileName);

await sharp(req.file.buffer)
.resize(800, 800, {
fit: 'inside',
withoutEnlargement: true
})
.jpeg({ quality: 80 })
.toFile(path.join(__dirname, imagePath));

imageUrl = `/uploads/${fileName}`;
}

const post = new Post({
user: req.user._id,
content: content || '',
image: imageUrl,
likes: [],
comments: []
});

await post.save();
await post.populate('user', 'username avatar');

res.status(201).json(post);
} catch (error) {
console.error('Post oluşturma hatası:', error);
res.status(500).json({
message: 'Post oluşturulurken hata oluştu',
error: error.message
});
}
});

app.put('/api/posts/:postId/like', authMiddleware, async (req, res) => {
try {
const post = await Post.findById(req.params.postId);

if (!post) {
return res.status(404).json({ message: 'Post bulunamadı' });
}

const likeIndex = post.likes.indexOf(req.user._id);

if (likeIndex === -1) {
post.likes.push(req.user._id);
// Post sahibine bildirim gönder
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
console.error('Like hatası:', error);
res.status(500).json({ message: 'Beğeni işlemi başarısız oldu' });
}
});

app.post('/api/posts/:postId/comments', authMiddleware, async (req, res) => {
try {
const { content } = req.body;
const post = await Post.findById(req.params.postId);

if (!post) {
return res.status(404).json({ message: 'Post bulunamadı' });
}

post.comments.push({
user: req.user._id,
content,
createdAt: new Date()
});

// Post sahibine bildirim gönder
if (post.user.toString() !== req.user._id.toString()) {
const postUser = await User.findById(post.user);
await postUser.addNotification('comment', req.user._id, post._id);
}

await post.save();
await post.populate('user', 'username avatar');
await post.populate('comments.user', 'username avatar');

res.status(201).json(post);
} catch (error) {
console.error('Yorum hatası:', error);
res.status(500).json({ message: 'Yorum eklenirken hata oluştu' });
}
});

app.delete('/api/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
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
console.error('Yorum silme hatası:', error);
res.status(500).json({ message: 'Yorum silinirken hata oluştu' });
}
});

app.delete('/api/posts/:postId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post bulunamadı' });
    }

    // Post sahibi kontrolü
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    // Eğer post'ta resim varsa, dosya sisteminden sil
    if (post.image) {
      const imagePath = path.join(__dirname, 'public', post.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await post.deleteOne();
    res.json({ message: 'Post başarıyla silindi' });
    
  } catch (error) {
    console.error('Post silme hatası:', error);
    res.status(500).json({ message: 'Post silinirken bir hata oluştu' });
  }
});

// Bildirim Route'ları
app.get('/api/users/notifications', authMiddleware, async (req, res) => {
try {
const user = await User.findById(req.user._id)
.populate('notifications.from', 'username avatar')
.populate('notifications.post', 'content');

res.json(user.notifications);
} catch (error) {
console.error('Bildirimleri getirme hatası:', error);
res.status(500).json({ message: 'Bildirimler getirilirken bir hata oluştu' });
}
});

app.put('/api/users/notifications/mark-read', authMiddleware, async (req, res) => {
try {
const user = await User.findById(req.user._id);

user.notifications = user.notifications.map(notification => {
notification.read = true;
return notification;
});

await user.save();
res.json({ message: 'Tüm bildirimler okundu olarak işaretlendi' });
} catch (error) {
console.error('Bildirim güncelleme hatası:', error);
res.status(500).json({ message: 'Bildirimler güncellenirken bir hata oluştu' });
}
});

// Kullanıcı Arama Route'u
app.get('/api/users/search', authMiddleware, async (req, res) => {
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
console.error('Kullanıcı arama hatası:', error);
res.status(500).json({ message: 'Kullanıcılar aranırken bir hata oluştu' });
}
});

// Kullanıcı Durumu Güncelleme Route'u
app.put('/api/users/status', authMiddleware, async (req, res) => {
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
console.error('Durum güncelleme hatası:', error);
res.status(500).json({ message: 'Durum güncellenirken bir hata oluştu' });
}
});

// Hata yakalama middleware'leri
app.use((error, req, res, next) => {
if (error instanceof multer.MulterError) {
if (error.code === 'LIMIT_FILE_SIZE') {
return res.status(400).json({ message: 'Dosya boyutu çok büyük (max: 5MB)' });
}
}
console.error('Sunucu hatası:', error);
res.status(500).json({ message: 'Sunucu hatası' });
});

// 404 handler
app.use((req, res) => {
res.status(404).json({ message: 'Sayfa bulunamadı' });
});

// Server başlatma
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
});