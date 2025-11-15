// Run once to create an example movie and admin user (node src/seeder.js)
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Movie from './models/Movie.js';
import bcrypt from 'bcrypt';

dotenv.config();
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cineflix';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
const adminPass = process.env.ADMIN_PASSWORD || 'adminpassword';

async function run() {
  await mongoose.connect(mongoUri);
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    const hash = await bcrypt.hash(adminPass, 10);
    const u = new User({ email: adminEmail, passwordHash: hash, role: 'admin' });
    await u.save();
    console.log('Admin created:', adminEmail);
  }
  const already = await Movie.findOne({ title: 'Big Buck Bunny' });
  if (!already) {
    const m = new Movie({
      title: 'Big Buck Bunny',
      description: 'Sample public domain video.',
      year: 2008,
      poster: '/assets/placeholder.jpg',
      sources: [{ quality:'HD', type:'video/mp4', src:'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }]
    });
    await m.save();
    console.log('Sample movie created');
  }
  process.exit(0);
}

run().catch(e=>{console.error(e); process.exit(1)});
