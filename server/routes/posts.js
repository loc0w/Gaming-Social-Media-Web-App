const router = require('express').Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// Tüm gönderileri getir
router.get('/', auth, async (req, res, next) => {
  try {
    const { sort = 'newest' } = req.query;
    let sortOption = {};

    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'popular':
        sortOption = { 
          likesCount: -1, 
          commentsCount: -1, 
          createdAt: -1 
        };
        break;
      case 'trending':
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const trendingPosts = await Post.aggregate([
          {
            $addFields: {
              recentLikes: {
                $size: {
                  $filter: {
                    input: '$likes',
                    as: 'like',
                    cond: { $gte: ['$$like.createdAt', twentyFourHoursAgo] }
                  }
                }
              },
              recentComments: {
                $size: {
                  $filter: {
                    input: '$comments',
                    as: 'comment',
                    cond: { $gte: ['$$comment.createdAt', twentyFourHoursAgo] }
                  }
                }
              }
            }
          },
          {
            $sort: {
              recentLikes: -1,
              recentComments: -1,
              createdAt: -1
            }
          }
        ]).exec();

        await Post.populate(trendingPosts, {
          path: 'user',
          select: 'username avatar'
        });

        return res.json(trendingPosts);

      case 'newest':
      default:
        sortOption = { createdAt: -1 };
    }

    const posts = await Post.find()
      .sort(sortOption)
      .populate('user', 'username avatar')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username avatar' }
      });

    res.json(posts);
  } catch (err) {
    console.error('Post getirme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni gönderi oluştur
router.post('/', auth, async (req, res, next) => {
  try {
    const { content, game } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'İçerik boş olamaz' });
    }

    const newPost = new Post({
      content: content.trim(),
      game: game?.trim(),
      user: req.user.id,
      likes: [],
      comments: [],
      likesCount: 0,
      commentsCount: 0,
    });

    await newPost.save();
    
    const populatedPost = await Post.findById(newPost._id)
      .populate('user', 'username avatar');

    res.status(201).json(populatedPost);
  } catch (err) {
    console.error('Post oluşturma hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Gönderiyi beğen/beğenmekten vazgeç
router.put('/:id/like', auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Gönderi bulunamadı' });
    }

    const likeIndex = post.likes.indexOf(req.user.id);
    
    if (likeIndex === -1) {
      post.likes.push(req.user.id);
      post.likesCount = post.likes.length;
    } else {
      post.likes.splice(likeIndex, 1);
      post.likesCount = post.likes.length;
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'username avatar');

    res.json(updatedPost);
  } catch (err) {
    console.error('Beğeni hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Gönderiyi sil
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Gönderi bulunamadı' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    await post.remove();
    res.json({ message: 'Gönderi silindi' });
  } catch (err) {
    console.error('Post silme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;