import express from 'express';
import Movie from '../models/Movie.js';
const router = express.Router();

// public list
router.get('/', async (req, res) => {
  const list = await Movie.find().select('-__v');
  res.json(list);
});

// public detail
router.get('/:id', async (req, res) => {
  const m = await Movie.findById(req.params.id);
  if (!m) return res.status(404).json({ error: 'Not found' });
  res.json(m);
});

export default router;
