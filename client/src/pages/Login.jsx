import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Key, Mail, Lock, CheckSquare, Square, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Mod: 'login', 'register', 'forgot'
  const [mode, setMode] = useState('login');
  
  // KVKK States
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [showKvkkModal, setShowKvkkModal] = useState(false);

  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'register' && !kvkkAccepted) {
        throw new Error("Lütfen KVKK Aydınlatma Metni'ni onaylayın.");
      }

      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/student');
      } else if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Kayıt başarılı! Lütfen giriş yapın.');
        setMode('login');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        alert('Şifre sıfırlama bağlantısı e-postanıza gönderildi!');
        setMode('login');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative">
        
        {/* KVKK Modal */}
        {showKvkkModal && (
          <div className="absolute inset-0 bg-white z-50 p-6 overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-800">KVKK Aydınlatma Metni</h3>
              <button onClick={() => setShowKvkkModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200"><X className="w-5 h-5"/></button>
            </div>
            <div className="flex-1 text-sm text-slate-600 space-y-4">
              <p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, Mertyk KPSS V2 uygulaması olarak kişisel verilerinizi korumaya büyük önem veriyoruz.</p>
              <p><strong>1. Hangi Verileri Topluyoruz?</strong><br/>Uygulamaya kayıt olurken e-posta adresinizi ve kullanım sırasında yüklediğiniz soru görsellerini sistemlerimizde güvenle (Şifreli veritabanımız Supabase üzerinde) saklıyoruz.</p>
              <p><strong>2. Verileri Ne Amaçla Kullanıyoruz?</strong><br/>Size kişiselleştirilmiş "Yanlış Kumbarası" ve "Akıllı Tekrar (Spaced Repetition)" hizmetini sunabilmek için bu veriler işlenmektedir. Asla 3. şahıslara satılmaz veya paylaşılmaz.</p>
              <p><strong>3. Haklarınız Nelerdir?</strong><br/>Kanunun 11. maddesi uyarınca hesabınızı ve verilerinizi dilediğiniz zaman silme hakkına sahipsiniz.</p>
            </div>
            <button onClick={() => { setKvkkAccepted(true); setShowKvkkModal(false); }} className="mt-6 w-full py-3 bg-primary-600 text-white font-bold rounded-xl">Okudum, Onaylıyorum</button>
          </div>
        )}

        <div className="bg-primary-600 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Key className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Mertyk KPSS V2</h1>
          <p className="text-primary-100 opacity-90 text-sm">Dijital Soru Kumbarası</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
            {mode === 'login' ? 'Giriş Yap' : mode === 'register' ? 'Yeni Hesap Oluştur' : 'Şifremi Unuttum'}
          </h2>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="email" placeholder="E-posta Adresi" required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            {mode !== 'forgot' && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="password" placeholder="Şifre" required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            )}

            {mode === 'register' && (
              <div className="flex items-start space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <button type="button" onClick={() => setKvkkAccepted(!kvkkAccepted)} className="mt-0.5 text-primary-600">
                  {kvkkAccepted ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                </button>
                <p className="text-xs text-slate-600 leading-tight">
                  <button type="button" onClick={() => setShowKvkkModal(true)} className="text-primary-600 font-bold hover:underline">Kullanıcı Sözleşmesini ve KVKK Metnini</button> okudum ve kabul ediyorum.
                </p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center">
              {loading ? 'Bekleniyor...' : (mode === 'login' ? 'Giriş Yap' : mode === 'register' ? 'Kayıt Ol' : 'Şifremi Sıfırla')}
            </button>
          </form>

            <button type="button" onClick={async () => {
              const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
              if(error) setError(error.message);
            }} className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center mt-3">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google ile Hızlı Giriş Yap
            </button>
            

          {mode === 'login' && (
            <div className="mt-6 space-y-2 text-center text-sm font-medium">
              <button onClick={() => setMode('forgot')} className="text-slate-500 hover:text-primary-600 block w-full">Şifremi unuttum</button>
              <button onClick={() => setMode('register')} className="text-primary-600 hover:text-primary-800 block w-full">Hesabım yok, Kayıt Ol</button>
            </div>
          )}
          {mode !== 'login' && (
            <div className="mt-6 text-center text-sm font-medium">
              <button onClick={() => setMode('login')} className="text-primary-600 hover:text-primary-800 block w-full">Zaten hesabım var, Giriş Yap</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
