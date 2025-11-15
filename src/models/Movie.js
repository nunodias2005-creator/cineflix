import mongoose from 'mongoose';

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  year: Number,
  poster: String,

  // soit des vidéos hébergées direct (mp4, m3u8, etc.)
  sources: [{
    quality: String,
    type: String,   // 'video/mp4', 'application/x-mpegURL', 'iframe'
    src: String     // URL directe du fichier ou du flux
  }],

  // soit un embed complet (par ex. un iframe YouTube/Vimeo)
  embedHtml: String,  // optionnel: code <iframe> complet

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Movie', MovieSchema);
