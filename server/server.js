import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/auth.js';
import questionRoutes from './routes/questions.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io Kurulumu (Canlı Sınıf İçin)
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Production'da sadece kendi domaininize izin verin
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// MongoDB Bağlantısı (Azure Cosmos DB MongoDB API)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB (Cosmos DB) bağlantısı başarılı!'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Rotalar
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);

// Test Rotası (API için)
app.get('/api/health', (req, res) => {
  res.send('Mertyk KPSS Backend Çalışıyor!');
});

// Frontend'i Serve Et (Production)
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Socket.io Olayları
io.on('connection', (socket) => {
  console.log('Kullanıcı bağlandı:', socket.id);

  // Odaya Katılma
  socket.on('join_room', (roomCode) => {
    socket.join(roomCode);
    console.log(`${socket.id} kullanıcısı ${roomCode} odasına katıldı.`);
  });

  // Öğretmenden Soru Geldiğinde (Broadcast)
  socket.on('send_question', (data) => {
    // data: { roomCode, question }
    io.to(data.roomCode).emit('new_question', { question: data.question });
  });

  // Öğrenci Cevapladığında
  socket.on('student_answer', (data) => {
    // Öğretmene ilet
    socket.to(data.roomCode).emit('student_answered', data);
  });

  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
