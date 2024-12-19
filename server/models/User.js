// models/User.js
const mongoose = require('mongoose');

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
      enum: ['friendRequest', 'friendAccept', 'like', 'comment', 'message']
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation'
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

userSchema.methods.addNotification = function(type, fromUser, reference = null) {
  const notification = {
    type,
    from: fromUser,
    read: false,
    createdAt: Date.now()
  };

  if (type === 'like' || type === 'comment') {
    notification.post = reference;
  } else if (type === 'message') {
    notification.conversation = reference;
  }

  this.notifications.push(notification);
  return this.save();
};

module.exports = mongoose.model('User', userSchema);