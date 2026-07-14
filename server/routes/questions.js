import express from 'express';
import multer from 'multer';
import Question from '../models/Question.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadImageToAzure } from '../config/azureStorage.js';

const router = express.Router();

// Multer (Memory Storage)
const upload = multer({ storage: multer.memoryStorage() });

// Soru Ekle
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { seviye, ders, dogru_cevap, cozum_linki, hatirlatma_tipi, hatirlatma_degeri } = req.body;
    let image_url = '';

    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop() || 'jpg';
      const fileName = `${req.user.id}-${Date.now()}.${fileExt}`;
      image_url = await uploadImageToAzure(req.file.buffer, fileName, req.file.mimetype);
    } else {
      return res.status(400).json({ message: 'Lütfen bir fotoğraf ekleyin.' });
    }

    const newQuestion = new Question({
      user_id: req.user.id,
      image_url,
      seviye,
      ders,
      dogru_cevap,
      cozum_linki,
      hatirlatma_tipi,
      hatirlatma_degeri: parseInt(hatirlatma_degeri) || 3
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ message: 'Soru eklenirken hata oluştu', error: error.message });
  }
});

// Öğrencinin Sorularını Getir
router.get('/', requireAuth, async (req, res) => {
  try {
    const questions = await Question.find({ user_id: req.user.id }).sort({ created_at: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Sorular getirilirken hata oluştu', error: error.message });
  }
});

export default router;
