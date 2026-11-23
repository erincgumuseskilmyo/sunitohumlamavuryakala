/* ============================================================
   DATA.JS — TURLAR VE KARTLAR

   Her kart:  id = görsel dosyasının adı (gorseller/<id>.jpg|.png|.webp)
              l  = kart üzerindeki yazı
              e  = görsel bulunamazsa gösterilecek emoji
              w = neden doğru/yanlış (oyun sonu özetinde gösterilir)
   Fotoğraf kaynakları ve lisansları: CREDITS.md
============================================================ */

const ROUNDS = [
  {
    title: 'Malzeme',
    instruction: 'SUNİ TOHUMLAMA MALZEMESİ OLANLARI VUR!',
    correct: [
      { id: '1_sivi_azot_tanki', l: 'Sıvı azot tankı', e: '🖼️', w: 'Dondurulmuş sperma −196 °C sıvı azotta saklanır.' },
      { id: '1_payet_sperma', l: 'Payet (sperma)', e: '🖼️', w: 'Dondurulmuş sperma ince plastik payetler içinde saklanır.' },
      { id: '1_rektal_eldiven', l: 'Rektal eldiven', e: '🖼️', w: 'Rekto-vaginal yöntemde rektumdaki el eldivenle korunur.' },
      { id: '1_cozdurme_su_banyosu', l: 'Çözdürme su banyosu', e: '🖼️', w: 'Payet sabit sıcaklıktaki suda çözdürülür.' },
      { id: '1_tohumlama_pistoleti', l: 'Tohumlama pistoleti', e: '💉', w: 'Payet pistolete yerleştirilip uterusa ulaştırılır.' },
      { id: '1_payet_makasi', l: 'Payet makası', e: '✂️', w: 'Payetin mühürlü ucu makasla düz kesilir.' },
    ],
    wrong: [
      { id: '1_renet', l: 'Renet', e: '🖼️', w: 'Tırnak bakımında kullanılan kıvrık uçlu bir bıçaktır.' },
      { id: '1_cerrahi_igne', l: 'Cerrahi iğne', e: '🖼️', w: 'Cerrahi dikiş atmak için kullanılır.' },
      { id: '1_inek_agiz_sondasi', l: 'İnek ağız sondası', e: '🖼️', w: 'Ağızdan işkembeye sıvı vermek için kullanılabilir.' },
      { id: '1_muset', l: 'Muşet', e: '🖼️', w: 'Sığırın başını kontrol etmek için kullanılan burun pensidir.' },
      { id: '1_stetoskop', l: 'Stetoskop', e: '🖼️', w: 'Muayene aracıdır; tohumlama setinde yer almaz.' },
    ],
  },
  {
    title: 'Kızgınlık',
    instruction: 'KIZGINLIKTAKİ (ÖSTRUS) İNEĞİN BELİRTİLERİNİ VUR!',
    correct: [
      { id: '2_uzerine_atlaninca_kipirdamaz', l: 'Üzerine atlanınca kıpırdamaz', e: '🐄', w: 'Durgun kızgınlık: en güvenilir kızgınlık belirtisidir.' },
      { id: '2_bogurme_huzursuzluk', l: 'Böğürme, huzursuzluk', e: '🖼️', w: 'Kızgın inek huzursuzdur, sık böğürür.' },
      { id: '2_berrak_ipliksi_mukus', l: 'Berrak, ipliksi mukus', e: '💧', w: 'Vulvadan berrak, uzayan (ipliksi) mukus akar.' },
      { id: '2_vulva_sis_ve_kizarik', l: 'Vulva şiş ve kızarık', e: '🔴', w: 'Östrojen etkisiyle vulva ödemli ve kızarıktır.' },
      { id: '2_sut_veriminde_ani_dusus', l: 'Süt veriminde ani düşüş', e: '🥛', w: 'Kızgınlık günü süt verimi geçici olarak düşebilir.' },
    ],
    wrong: [
      { id: '2_sakin_sakin_otluyor', l: 'Sakin sakin otluyor', e: '🖼️', w: 'Normal, ilgisiz davranış kızgınlık göstermez.' },
      { id: '2_ileri_gebelik', l: 'İleri gebelik', e: '🖼️', w: 'Gebe inek kızgınlık göstermez; tohumlanmaz.' },
      { id: '2_hasta_yatiyor', l: 'Hasta, yatıyor', e: '🖼️', w: 'Hastalık belirtisidir; önce tedavi gerekir.' },
      { id: '2_yeni_dogum_yapmis', l: 'Yeni doğum yapmış', e: '🖼️', w: 'Doğum sonrası dönemde (lohusalık) tohumlama yapılmaz.' },
      { id: '2_kanli_akinti', l: 'Kanlı akıntı', e: '🩸', w: 'Kızgınlıktan 1–3 gün sonra görülür (metöstrus); kızgınlık geçmiştir.' },
    ],
  },
  {
    title: 'Hijyen',
    instruction: 'TOHUMLAMADA UYULMASI GEREKEN HİJYEN KURALINA VUR!',
    correct: [
      { id: '3_eldiven_giymek', l: 'Eldiven giymek', e: '🖼️', w: 'Hem uygulayıcıyı hem hayvanı enfeksiyondan korur.' },
      { id: '3_vulvayi_kagit_havluyla_silme', l: 'Vulvayı kağıt havluyla silmek', e: '🖼️', w: 'Pistole girmeden önce vulva temizlenip kurulanır.' },
      { id: '3_tek_kullanimlik_kilif', l: 'Tek kullanımlık kılıf', e: '🛡️', w: 'Her hayvanda yeni steril kılıf kullanılır.' },
      { id: '3_ekipmani_temizleyip_kurutmak', l: 'Ekipmanı temizleyip kurutmak', e: '🧽', w: 'Kullanım sonrası temizlik bulaşmayı önler.' },
    ],
    wrong: [
      { id: '3_ciplak_elle_calismak', l: 'Çıplak elle çalışmak', e: '✋', w: 'Uygulayıcı ve hayvan için enfeksiyon riski taşır.' },
      { id: '3_kilifi_tekrar_kullanmak', l: 'Kılıfı tekrar kullanmak', e: '🔁', w: 'Hayvandan hayvana hastalık taşır.' },
      { id: '3_kirli_pistole_kullanmak', l: 'Kirli pistole kullanmak', e: '🦠', w: 'Uterusa mikrop taşır, endometrite yol açabilir.' },
      { id: '3_vulvayi_silmeden_girmek', l: 'Vulvayı silmeden girmek', e: '🚫', w: 'Dışkı ve kir vajene taşınır.' },
    ],
  },
  {
    title: 'Çözdürme',
    instruction: 'DOĞRU PAYET ÇÖZDÜRME / HAZIRLIK ADIMINI VUR!',
    correct: [
      { id: '4_payeti_tanktan_hizla_al', l: 'Payeti tanktan hızla al', e: '🖼️', w: 'Kanister tank boğazında kısa süre tutulur; spermler ısınmamalıdır.' },
      { id: '4_35_37_c_suda_30_45_sn', l: '35–37 °C suda 30–45 sn', e: '🖼️', w: 'Önerilen çözdürme: 35–37 °C su, 30–45 saniye.' },
      { id: '4_payeti_kagitla_kurula', l: 'Payeti kağıtla kurulamak', e: '🖼️', w: 'Su damlası spermleri öldürür; payet kurulanır.' },
      { id: '4_muhurlu_ucu_duz_kes', l: 'Mühürlü ucu düz kesmek', e: '✂️', w: 'Düz kesim sızıntıyı ve geri akışı önler.' },
      { id: '4_pistolete_yerlestir_kilif_ta', l: 'Pistolete yerleştir, kılıf tak', e: '💉', w: 'Çözdürülen payet hemen pistolete yüklenir.' },
    ],
    wrong: [
      { id: '4_tavada_isitmak', l: 'Tavada ısıtmak', e: '🖼️', w: 'Aşırı ısı spermleri öldürür.' },
      { id: '4_guneste_bekletmek', l: 'Güneşte bekletmek', e: '🖼️', w: 'Güneş ışığı ve ısı spermlere zarar verir.' },
      { id: '4_atese_tutmak', l: 'Ateşe tutmak', e: '🖼️', w: 'Kontrolsüz ısı spermleri öldürür.' },
      { id: '4_tuzlu_suya_koymak', l: 'Tuzlu suya koymak', e: '🖼️', w: 'Çözdürme temiz, sabit ısıdaki suda yapılır.' },
      { id: '4_cozuleni_tekrar_dondurmak', l: 'Çözüleni tekrar dondurmak', e: '🧊', w: 'Çözdürülen payet yeniden dondurulamaz; hemen kullanılır.' },
    ],
  },
  {
    title: 'Uygulama',
    instruction: 'DOĞRU TOHUMLAMA ZAMANI / UYGULAMASINI VUR!',
    correct: [
      { id: '5_sabah_kizgin_aksam_tohumla', l: 'Sabah kızgın → akşam tohumla', e: '🌅', w: 'Sabah-akşam kuralı: ovulasyon kızgınlık bitiminden ~10–12 saat sonradır.' },
      { id: '5_aksam_kizgin_ertesi_sabah', l: 'Akşam kızgın → ertesi sabah', e: '🌙', w: 'Sabah-akşam kuralının diğer yarısı.' },
      { id: '5_rekto_vaginal_yontem', l: 'Rekto-vaginal yöntem', e: '🖼️', w: 'Bir el rektumdan serviksi tutar, diğeri pistoleti ilerletir.' },
      { id: '5_spermayi_uterus_govdesine_bi', l: 'Spermayı uterus gövdesine bırak', e: '🎯', w: 'Sperma serviksin hemen önüne, uterus gövdesine bırakılır.' },
    ],
    wrong: [
      { id: '5_kizginliktan_2_gun_sonra', l: 'Kızgınlıktan 2 gün sonra', e: '📅', w: 'Çok geç; yumurta canlılığını yitirmiştir.' },
      { id: '5_vajen_girisine_birakmak', l: 'Vajen girişine bırakmak', e: '↩️', w: 'Sperma serviksi geçemez; gebelik oranı çok düşer.' },
      { id: '5_pistoleti_zorla_itmek', l: 'Pistoleti zorla itmek', e: '💥', w: 'Serviks ve uterus yaralanabilir.' },
      { id: '5_kizginlik_gormeden_tohumlama', l: 'Kızgınlık görmeden tohumlamak', e: '🎲', w: 'Zamanlama tutmaz; gebelik oranı düşer.' },
    ],
  },
];
