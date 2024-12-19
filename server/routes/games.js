const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Kullanıcının oyun listesine oyun ekle
router.post('/add', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const { name, platform, gameId } = req.body;

    user.games.push({
      name,
      platform,
      gameId,
      addedAt: new Date()
    });

    await user.save();
    res.json(user.games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Kullanıcının oyun listesinden oyun kaldır
router.delete('/remove/:gameId', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.games = user.games.filter(game => game.gameId !== req.params.gameId);
    await user.save();
    res.json(user.games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;