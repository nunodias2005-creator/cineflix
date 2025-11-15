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
// Connect Mongo and start
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cineflix';
import Movie from './models/Movie.js';

async function seedIfEmpty() {
  const count = await Movie.countDocuments();
  if (count > 0) return;

  console.log('No movies found, seeding demo data...');

  const demoMovies = [
    {
      title: 'La Nuit Rouge',
      description: "Thriller fictif : une ville plongée dans le noir, un secret qui refait surface.",
      year: 2023,
      poster: '/assets/nuit-rouge.jpg',
      sources: [
        {
          quality: 'HD',
          type: 'video/mp4',
          src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        }
      ]
    },
    {
      title: 'Eclipse Urbaine',
      description: "Film de science-fiction fictif, dans une mégalopole futuriste.",
      year: 2025,
      poster: '/assets/eclipse-urbaine.jpg',
      sources: [
        {
          quality: 'HD',
          type: 'video/mp4',
          src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
        }
      ]
    },
    {
      title: 'Vertige',
      description: "Drame psychologique autour d\'un producteur dépassé par son propre succès.",
      year: 2022,
      poster: '/assets/vertige.jpg',
      sources: [
        {
          quality: 'HD',
          type: 'video/mp4',
          src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
        }
      ]
    }
  ];

  await Movie.insertMany(demoMovies);
  console.log('Demo movies seeded ✔️');
}

mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB connected');
    await seedIfEmpty();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Mongo connection error:', err);
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT} (no DB, demo only)`)
    );
  });
