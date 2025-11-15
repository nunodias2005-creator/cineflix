import mongoose from 'mongoose';

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  year: Number,
  poster: String,
  sources: [{
    quality: String,
    type: String,
    src: String
  }],
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.model('Movie', MovieSchema);
