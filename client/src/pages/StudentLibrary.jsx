import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookX, Trophy, Flame, Play, Plus, Target, Brain, TrendingUp, Download, Loader2 } from 'lucide-react';
import api from '../lib/api';
import jsPDF from 'jspdf';

export default function StudentLibrary() {
  const navigate = useNavigate();
  const [loadingMore, setLoadingMore] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Backend'den soruları çek
        const response = await api.get('/questions');
        setWrongAnswers(response.data || []);
      } catch (error) {
        console.error('Soru çekme hatası:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Sonsuz Kaydırma Simülasyonu
  const handleScroll = (e) => {
    // Implement real pagination later if needed
  };

  const handleExportPDF = async () => {
    if (wrongAnswers.length === 0) {
      alert('PDF oluşturulacak soru bulunamadı.');
      return;
    }
    
    alert('PDF oluşturuluyor, lütfen bekleyin. İnternet hızınıza göre birkaç saniye sürebilir...');
    
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();
      let yOffset = 10;

      for (let i = 0; i < wrongAnswers.length; i++) {
        const item = wrongAnswers[i];
        if (!item.image_url) continue;

        // Resmi blob olarak çek (CORS sorunlarını aşmak için DataURL'e çevir)
        const res = await fetch(item.image_url);
        const blob = await res.blob();
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        // Resim boyutlarını hesapla
        const img = new Image();
        img.src = base64;
        await new Promise((resolve) => { img.onload = resolve; });

        const imgWidth = pdfWidth - 20; // Kenarlardan 10mm boşluk
        const imgRatio = img.width / img.height;
        const imgHeight = imgWidth / imgRatio;

        // Sayfa sonuna geldiysek yeni sayfa ekle
        if (yOffset + imgHeight + 10 > pdfHeight - 10 && i > 0) {
          doc.addPage();
          yOffset = 10;
        }

        // Soru bilgilerini yaz
        doc.setFontSize(10);
        doc.text(`Tarih: ${new Date(item.created_at).toLocaleDateString('tr-TR')} | Ders: ${item.ders || '-'} | Cevap: ${item.dogru_cevap || '-'}`, 10, yOffset);
        yOffset += 5;

        // Resmi PDF'e ekle
        // Formatı otomatik algılaması için 'JPEG' veya 'PNG' yerine sadece extension kullanıyoruz.
        const format = item.image_url.toLowerCase().endsWith('.png') ? 'PNG' : 'JPEG';
        doc.addImage(base64, format, 10, yOffset, imgWidth, imgHeight);
        yOffset += imgHeight + 15; // Bir sonraki soru için boşluk bırak
      }

      doc.save('Mertyk_Yanlis_Kumbaram.pdf');
    } catch (error) {
      console.error('PDF Hatası:', error);
      alert('PDF oluşturulurken bir hata oluştu: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:flex-row md:pb-0" onScroll={handleScroll} style={{overflowY: 'auto'}}>
      
      {/* MASAÜSTÜ SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0 p-4 z-20">
        <div className="text-xl font-bold text-primary-600 mb-8 px-4">Mertyk KPSS</div>
        <nav className="flex-1 space-y-2">
          <button onClick={()=>navigate('/student')} className="flex items-center w-full px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium"><Brain className="w-5 h-5 mr-3"/> Canlı Sınav</button>
          <button className="flex items-center w-full px-4 py-3 bg-primary-50 text-primary-600 rounded-xl font-bold"><Target className="w-5 h-5 mr-3"/> Kumbaram</button>
          <button onClick={()=>navigate('/student/analytics')} className="flex items-center w-full px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium"><TrendingUp className="w-5 h-5 mr-3"/> İstatistiklerim</button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-4 py-4 flex items-center sticky top-0 z-10 md:hidden">
          <button onClick={() => navigate('/student')} className="text-slate-500 p-1 mr-3 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-slate-800 text-lg">Yanlış Kumbaram</h1>
          </div>
        </header>

        <div className="p-4 bg-primary-600 text-white shadow-md">
          <div className="flex justify-around items-center max-w-4xl mx-auto">
            <div className="text-center">
              <Trophy className="w-8 h-8 mx-auto mb-1 text-yellow-300" />
              <div className="font-bold text-xl">1,250</div>
              <div className="text-xs text-primary-100">Toplam Puan</div>
            </div>
            <div className="w-px h-12 bg-primary-500"></div>
            <div className="text-center">
              <Flame className="w-8 h-8 mx-auto mb-1 text-orange-400" />
              <div className="font-bold text-xl">12</div>
              <div className="text-xs text-primary-100">Seri Soru</div>
            </div>
            <div className="w-px h-12 bg-primary-500"></div>
            <div className="text-center">
              <BookX className="w-8 h-8 mx-auto mb-1 text-red-300" />
              <div className="font-bold text-xl">{wrongAnswers.length} / 50</div>
              <div className="text-xs text-primary-100">Kota Durumu</div>
            </div>
          </div>
        </div>

        <main className="flex-1 p-4 max-w-2xl mx-auto w-full mt-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <BookX className="w-5 h-5 mr-2 text-red-500" />
              Tekrar Edilecek Sorular
            </h2>
            <button onClick={handleExportPDF} className="flex items-center px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-700 shadow-sm transition-colors">
              <Download className="w-4 h-4 mr-2" /> PDF İndir
            </button>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
            ) : wrongAnswers.length === 0 ? (
              <div className="text-center py-10 text-slate-500">Henüz kumbarada soru yok.</div>
            ) : wrongAnswers.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs text-slate-400 mb-2">{new Date(item.created_at).toLocaleDateString('tr-TR')}</p>
                {item.image_url && (
                  <img src={item.image_url} alt="Soru" className="w-full max-h-64 object-contain rounded-lg mb-4 border border-slate-100 bg-slate-50" />
                )}
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-start p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="font-bold text-slate-600 w-24 flex-shrink-0">Ders/Seviye:</span>
                    <span className="text-slate-700">{item.ders} - {item.seviye}</span>
                  </div>
                  {item.dogru_cevap && (
                    <div className="flex items-start p-3 bg-green-50 border border-green-100 rounded-lg">
                      <span className="font-bold text-green-600 w-24 flex-shrink-0">Doğru Cevap:</span>
                      <span className="text-green-700 font-medium">{item.dogru_cevap}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  {item.cozum_linki ? (
                    <a href={item.cozum_linki} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-semibold text-red-600 hover:text-red-700">
                      <Play className="w-4 h-4 mr-1" />
                      Çözüm Videosu
                    </a>
                  ) : (
                    <span></span>
                  )}
                  <button className="text-sm font-semibold text-primary-600 px-4 py-2 bg-primary-50 rounded-lg">
                    Tekrar Çöz
                  </button>
                </div>
              </div>
            ))}
          </div>

          {loadingMore && (
            <div className="flex justify-center p-4 text-primary-500">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
        </main>
      </div>

      {/* FAB - Soru Ekle */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 md:hidden">
        <button onClick={() => navigate('/student/add-question')}
          className="w-16 h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-primary-500/40 active:scale-95 border-4 border-slate-50">
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Mobil Alt Menü */}
      <nav className="md:hidden bg-white border-t border-slate-200 pb-safe fixed bottom-0 w-full z-10 h-16 px-6">
        <div className="flex justify-between items-center h-full max-w-md mx-auto">
          <button onClick={() => navigate('/student')} className="flex flex-col items-center justify-center w-1/3 text-slate-400">
            <Brain className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Sınav</span>
          </button>
          <button className="flex flex-col items-center justify-center w-1/3 text-primary-600">
            <Target className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">Kumbaram</span>
          </button>
          <button onClick={() => navigate('/student/analytics')} className="flex flex-col items-center justify-center w-1/3 text-slate-400">
            <TrendingUp className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Analiz</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
