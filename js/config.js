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
  supabaseUrl: 'https://kolufwwuvoxiotpzyhcw.supabase.co/rest/v1/',

  /* Supabase > Project Settings > API Keys > anon public
     Herkese açık anahtardır. Yetkisi supabase-schema.sql içindeki
     kurallarla sınırlıdır: yeni puan EKLENEBİLİR, tablo doğrudan
     OKUNAMAZ; sıralama yalnızca öğrenci numarası maskelenmiş
     görünümden okunur. */
  supabaseAnonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvbHVmd3d1dm94aW90cHp5aGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0ODI0MDUsImV4cCI6MjExMTA1ODQwNX0.b4i7yDXhpfepo-CzDQexKc2CRPwIps0CoJ0HXQKxspg',

  /* SQL şemasında oluşturulan adlar. Değiştirmeyin. */
  table: 'suni_tohumlama_vy_scores',
  boardView: 'suni_tohumlama_vy_board',

  /* Sınıf / şube kodu. Her sınıfa farklı kod verirseniz tablolar
     birbirine karışmaz. Örnek: 'VET-2A', 'lvs2026guz' */
  groupCode: 'vet2026guz',

  /* Puan tablosunda kaç kişi listelensin. */
  topCount: 20,
};
