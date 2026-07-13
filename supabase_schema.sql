-- Supabase Veritabanı Kurulum Dosyası (Güncellenmiş)
-- Bu kodları Supabase paneline girip "SQL Editor" kısmına yapıştırıp çalıştırın (RUN).

-- 1. Profiller Tablosu (Roller için)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profil RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kullanıcılar kendi profillerini görebilir" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Yeni kullanıcı kayıt olduğunda profile tablosuna ekleyen trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'student');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Tabloyu Oluşturma (Sorular)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT,
    seviye TEXT,
    ders TEXT,
    dogru_cevap TEXT,
    cozum_linki TEXT,
    hatirlatma_tipi TEXT,
    hatirlatma_degeri INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) Ayarları (Güvenlik)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kullanıcılar kendi sorularını görebilir" ON public.questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar soru ekleyebilir" ON public.questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi sorularını silebilir" ON public.questions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi sorularını güncelleyebilir" ON public.questions FOR UPDATE USING (auth.uid() = user_id);

-- 3. Storage Bucket (Depolama Kovası) Oluşturma
INSERT INTO storage.buckets (id, name, public) 
VALUES ('questions', 'questions', true)
ON CONFLICT (id) DO NOTHING;

-- Storage (Depolama) RLS Ayarları
CREATE POLICY "Herkes fotoğrafları görebilir" ON storage.objects FOR SELECT USING (bucket_id = 'questions');
CREATE POLICY "Kullanıcılar fotoğraf yükleyebilir" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'questions' AND auth.uid() = owner);
CREATE POLICY "Kullanıcılar kendi fotoğraflarını silebilir" ON storage.objects FOR DELETE USING (bucket_id = 'questions' AND auth.uid() = owner);
