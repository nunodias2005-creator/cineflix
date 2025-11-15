import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const router = express.Router();

// Register (for initial setup or testing)
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({error:'missing'});
  const existing = await User.findOne({email});
  if (existing) return res.status(400).json({error:'exists'});
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ email, passwordHash: hash, role: 'admin' });
  await user.save();
  res.json({ok:true});
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'invalid' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid' });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  res.json({ token, role: user.role });
});

export default router;
