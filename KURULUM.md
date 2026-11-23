# Vur-Yakala: Suni Tohumlama — Kurulum

Oyun saf HTML/CSS/JS'dir; derleme gerekmez. `index.html` dosyasını tarayıcıda açmak
oynamak için yeterlidir. Ortak puan tablosu için Supabase gerekir.

## ⚠️ Önce: Supabase adresi şu an çalışmıyor

`js/config.js` içindeki adres (`fopolcaxcsnxlarhpyts.supabase.co`), Membran Geçiş ve
Sindirim Yolculuğu oyunlarıyla ortak kullanılan projedir. **24 Eylül 2026'da bu adres
DNS'te bulunamadı** (proje silinmiş veya adres değişmiş olabilir). Bu düzelene kadar oyun
çalışır ama puanlar yalnızca öğrencinin kendi cihazında kalır ve ekranda bu açıkça yazar.

Yapılacak:

1. <https://supabase.com/dashboard> adresine girin. Proje listede görünüyor ve
   "Paused" durumundaysa **Restore** deyin; adres değişmeden geri gelir.
2. Proje yoksa **New project** ile yeni bir proje açın (ücretsiz plan yeterli).
3. **Project Settings → Data API** sayfasından *Project URL*'yi,
   **Project Settings → API Keys** sayfasından *anon public* anahtarını kopyalayıp
   `js/config.js` içindeki `supabaseUrl` ve `supabaseAnonKey` alanlarına yapıştırın.
   (Yeni proje açtıysanız aynı değişikliği diğer iki oyunun `config.js` dosyasında da yapın.)

## 1. Tabloyu oluşturma (bir kez)

1. Supabase panelinde **SQL Editor → New query**.
2. `supabase-schema.sql` dosyasının **tamamını** yapıştırıp **Run** deyin.
3. "Security Definer View" uyarısı görürseniz bu beklenen bir durumdur (dosyadaki açıklamaya bakın).

Bu şema:

- `suni_tohumlama_vy_scores` tablosunu kurar. Öğrenciler yalnızca **yeni puan ekleyebilir**;
  tabloyu okuyamaz, değiştiremez, silemez.
- `suni_tohumlama_vy_board` görünümünü kurar. Oyundaki tablo buradan okunur: her öğrencinin
  yalnızca en iyi puanı, **ad + soyadın baş harfi** ve **maskeli numara** (ör. `22•••••45`)
  görünür. Tam numara ve soyadı yalnızca siz (SQL Editor / Table Editor) görürsünüz.
- Oyun kurallarına göre imkânsız puanları reddeder (tam hile koruması değildir).

## 2. Sınıf kodu

`js/config.js` → `groupCode`. Her sınıf/şube için farklı bir kod verirseniz tablolar karışmaz.

## 3. Yayınlama

Klasörün tamamını (index.html, style.css, js/, assets/) herhangi bir statik barındırmaya
yükleyin:

- **Netlify Drop**: <https://app.netlify.com/drop> sayfasına klasörü sürükleyin.
- **GitHub Pages** veya **Vercel**: klasörü bir depoya koyup statik site olarak yayınlayın.

## 4. Deneme

Yayından sonra kendi adınızla bir oyun oynayın. Sonuç ekranında
"✔ … puan ortak tabloya kaydedildi" yazmalı ve tabloda adınız görünmeli.
Ardından Supabase **Table Editor → suni_tohumlama_vy_scores** içinde satırı görün.

## Öğretim elemanı için sorgular

`supabase-schema.sql` dosyasının sonunda: sınıf listesini tam numarayla çekme ve dersten
sonra tabloyu sıfırlama sorguları var.

## Yerelde çalıştırma

```bash
py -m http.server 5178 --directory Suni-Tohumlama-Vur-Yakala
```

Sonra tarayıcıda <http://localhost:5178>.

## Kart görsellerini değiştirme / ekleme

Görseller `gorseller/` klasöründen okunur; dosya adı kart kimliğidir
(ör. `gorseller/1_tohumlama_pistoleti.png`). Hangi kartın hangi adı beklediğini ve
hangilerinin eksik olduğunu görmek için `gorsel-kontrol.html` sayfasını açın.
Ayrıntı: `gorseller/OKU-BENI.txt`.

## Hız ayarı

`js/game.js` içinde: `ROUND_MS` (tur süresi), `spawnDelay()` (kart çıkma aralığı) ve
`life` (kartın delikte kalma süresi). Sayılar büyüdükçe oyun yavaşlar.
