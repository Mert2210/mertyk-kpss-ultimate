import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image_url: {
    type: String,
    required: true
  },
  seviye: String,
  ders: String,
  dogru_cevap: String,
  cozum_linki: String,
  hatirlatma_tipi: String,
  hatirlatma_degeri: Number,
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Question', questionSchema);
