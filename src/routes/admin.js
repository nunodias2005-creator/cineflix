import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
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
// Bot d'ajout automatique de film via TMDB
router.post('/auto-add', requireAuth('admin'), async (req, res) => {
  try {
    const { title } = req.body;
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      return res
        .status(500)
        .json({ error: 'TMDB_API_KEY non définie dans les variables env.' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Titre manquant' });
    }

    const query = encodeURIComponent(title.trim());
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=fr-FR&query=${query}`;

    const searchResp = await fetch(searchUrl);
    const searchJson = await searchResp.json();

    if (!searchJson.results || searchJson.results.length === 0) {
      return res.status(404).json({ error: 'Aucun film trouvé sur TMDB' });
    }

    // On prend le premier résultat
    const best = searchJson.results[0];

    const movieId = best.id;
    const detailUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=fr-FR&append_to_response=videos`;

    const detailResp = await fetch(detailUrl);
    const detailJson = await detailResp.json();

    const fullTitle = detailJson.title || detailJson.original_title || title;
    const description = detailJson.overview || '';
    const year = detailJson.release_date
      ? Number(detailJson.release_date.substring(0, 4))
      : null;

    const posterBase = 'https://image.tmdb.org/t/p/w780';
    const poster = detailJson.poster_path
      ? posterBase + detailJson.poster_path
      : '';

    // On cherche une vidéo YouTube de type "Trailer"
    let embedHtml = '';
    if (detailJson.videos && detailJson.videos.results) {
      const trailer = detailJson.videos.results.find(
        (v) => v.site === 'YouTube' && v.type === 'Trailer'
      );
      if (trailer) {
        const youtubeUrl = `https://www.youtube.com/embed/${trailer.key}`;
        embedHtml = `<iframe width="100%" height="100%" src="${youtubeUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      }
    }

    // Vérifier si film existe déjà (même titre + même année)
    const existing = await Movie.findOne({
      title: fullTitle,
      year: year || undefined
    });
    if (existing) {
      return res.json({ ok: true, movie: existing, info: 'Déjà existant' });
    }

    const movie = new Movie({
      title: fullTitle,
      description,
      year,
      poster,
      sources: [], // on n'utilise que embedHtml ici
      embedHtml,
      createdBy: req.user?.id
    });

    await movie.save();

    res.json({ ok: true, movie });
  } catch (err) {
    console.error('Erreur auto-add TMDB:', err);
    res.status(500).json({ error: 'Erreur serveurs TMDB / serveur interne' });
  }
});

export default router;
