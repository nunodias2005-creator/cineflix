import express from 'express';
import multer from 'multer';
import Movie from '../models/Movie.js';
import User from '../models/User.js';
import requireAuth from '../middleware/auth.js';
import path from 'path';

const router = express.Router();

// multer storage local
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    const now = Date.now();
    cb(null, now + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// create movie (admin only)
router.post('/movie', requireAuth('admin'), upload.fields([{name:'video'},{name:'poster'}]), async (req, res) => {
  try {
    const { title, description, year } = req.body;
    const posterFile = req.files && req.files.poster ? '/uploads/' + req.files.poster[0].filename : '';
    const videoFile = req.files && req.files.video ? '/uploads/' + req.files.video[0].filename : '';
    const movie = new Movie({
      title, description, year,
      poster: posterFile,
      sources: [{ quality: 'SD', type: 'video/mp4', src: videoFile }],
      createdBy: req.user.id
    });
    await movie.save();
    // Note: In production add transcoding (ffmpeg) and multi-bitrate (HLS/DASH) + CDN
    res.json({ ok:true, movie });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'server' });
  }
});

// list users (admin)
router.get('/users', requireAuth('admin'), async (req, res) => {
  const users = await User.find().select('-passwordHash -__v');
  res.json(users);
});

export default router;
