/* ============================================================
   CONFIG.JS — TEK AYAR DOSYASI

   Ortak (online) puan tablosu için yalnızca bu dosya düzenlenir.
   Adım adım kurulum: KURULUM.md

   Değerler "Membran Geçiş" ve "Sindirim Yolculuğu" oyunlarında
   kullanılan Supabase projesiyle aynıdır; yalnızca TABLO/GÖRÜNÜM
   adı farklıdır. supabase-schema.sql dosyasını o projede bir kez
   çalıştırmanız yeterlidir.

   URL veya anahtar boş bırakılırsa oyun yine çalışır; puanlar
   yalnızca o cihazda saklanır ve arayüz bunu açıkça söyler.
============================================================ */

const STV_CONFIG = {
  /* Supabase > Project Settings > Data API > Project URL */
  supabaseUrl: 'https://fopolcaxcsnxlarhpyts.supabase.co',

  /* Supabase > Project Settings > API Keys > anon public
     Herkese açık anahtardır. Yetkisi supabase-schema.sql içindeki
     kurallarla sınırlıdır: yeni puan EKLENEBİLİR, tablo doğrudan
     OKUNAMAZ; sıralama yalnızca öğrenci numarası maskelenmiş
     görünümden okunur. */
  supabaseAnonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcG9sY2F4Y3NueGxhcmhweXRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5NDM5ODMsImV4cCI6MjEwMzUxOTk4M30.pI6K4ifVoMhQsZHP-ll9597gPtmZr6Ze-nqsaCgPL-0',

  /* SQL şemasında oluşturulan adlar. Değiştirmeyin. */
  table: 'suni_tohumlama_vy_scores',
  boardView: 'suni_tohumlama_vy_board',

  /* Sınıf / şube kodu. Her sınıfa farklı kod verirseniz tablolar
     birbirine karışmaz. Örnek: 'VET-2A', 'lvs2026guz' */
  groupCode: 'vet2026guz',

  /* Puan tablosunda kaç kişi listelensin. */
  topCount: 20,
};
