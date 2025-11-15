import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';
import adminRoutes from './routes/admin.js';

dotenv.config();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Dossiers pour uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ⚠️ ROUTES API EN PREMIER
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/admin', adminRoutes);

// ⚠️ SERVE LE FRONT APRÈS LES ROUTES API
app.use(express.static(path.join(__dirname, '../public')));

// Fallback SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Connexion Mongo + démarrage
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cineflix';

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Mongo connection error:', err);
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (no DB)`));
  });
