-- ============================================================
-- VUR-YAKALA: SUNİ TOHUMLAMA — SUPABASE ŞEMASI (ortak puan tablosu)
-- ============================================================
-- KULLANIM
--   1) Supabase projenizde sol menüden "SQL Editor" > "New query"
--   2) Bu dosyanın TAMAMINI yapıştırıp "Run" deyin
--   3) js/config.js içindeki Project URL + anon key'i kontrol edin
-- Ayrıntılı anlatım: KURULUM.md
--
-- Bu dosyayı tekrar çalıştırmak güvenlidir (idempotent).
-- ============================================================

create table if not exists public.suni_tohumlama_vy_scores (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  student_no text not null,
  group_code text not null default 'genel',
  score integer not null check (score >= 0),
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  missed_count integer not null default 0,
  max_combo integer not null default 0,
  lives_left integer not null default 0,
  finished boolean not null default false,
  duration_seconds integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists stv_scores_board_idx
  on public.suni_tohumlama_vy_scores (group_code, student_no, score desc);

-- ------------------------------------------------------------
-- TEMEL SAHTE PUAN KORUMASI
-- ------------------------------------------------------------
-- Oyunun kurallarına göre üst sınırlar:
--   5 tur x 20 sn, en hızlı çıkış ~0,85 sn -> en fazla ~120 kart
--   doğru vuruş en fazla 20 puan (10 + kombo bonusu 10)
--   tüm turlar bitince kalan her can 25 puan (en fazla 5 can)
-- DÜRÜST NOT: Bu tam bir hile önleme DEĞİLDİR; kuralların içinde
-- kalan sahte bir puan hâlâ gönderilebilir. Tam koruma için puanı
-- bir Edge Function'da yeniden hesaplamak gerekir.

alter table public.suni_tohumlama_vy_scores
  drop constraint if exists stv_scores_plausible;

alter table public.suni_tohumlama_vy_scores
  add constraint stv_scores_plausible check (
    char_length(first_name) between 1 and 40
    and char_length(last_name) between 1 and 40
    and student_no ~ '^[0-9]{5,15}$'
    and correct_count between 0 and 160
    and wrong_count between 0 and 5
    and missed_count between 0 and 160
    and max_combo between 0 and 160
    and lives_left between 0 and 5
    and duration_seconds between 1 and 600
    and score <= correct_count * 20 + lives_left * 25
  );

-- ------------------------------------------------------------
-- GİZLİLİK: tablo doğrudan okunamaz
-- ------------------------------------------------------------
-- anon anahtarı herkese açık olduğundan, tablo okunabilir olsaydı
-- herkes tüm öğrenci numaralarını çekebilirdi. Bu yüzden:
--   * anon yalnızca INSERT yapabilir (SELECT politikası yok)
--   * sıralama aşağıdaki GÖRÜNÜMDEN okunur; orada numara maskelidir
--     ve her öğrencinin yalnızca en iyi puanı vardır.

alter table public.suni_tohumlama_vy_scores enable row level security;

drop policy if exists "Herkes skorlari okuyabilir" on public.suni_tohumlama_vy_scores;
drop policy if exists "Herkes yeni skor ekleyebilir" on public.suni_tohumlama_vy_scores;
create policy "Herkes yeni skor ekleyebilir"
  on public.suni_tohumlama_vy_scores for insert
  to anon, authenticated
  with check (true);

revoke select, update, delete on public.suni_tohumlama_vy_scores from anon, authenticated;
grant insert on public.suni_tohumlama_vy_scores to anon, authenticated;

-- Görünüm, sahibinin (postgres) yetkisiyle çalışır; bu KASITLIDIR.
-- Supabase "Security Definer View" uyarısı gösterebilir: görünüm
-- yalnızca maskeli ve özet veriyi açtığı için bu uyarı burada
-- beklenen bir durumdur.
drop view if exists public.suni_tohumlama_vy_board;
create view public.suni_tohumlama_vy_board as
select
  group_code,
  first_name,
  left(last_name, 1) || '.' as last_initial,
  left(student_no, 2) || repeat('•', greatest(char_length(student_no) - 4, 1)) || right(student_no, 2) as student_no_masked,
  score,
  correct_count,
  wrong_count,
  max_combo,
  finished,
  created_at
from (
  select distinct on (group_code, student_no) *
  from public.suni_tohumlama_vy_scores
  order by group_code, student_no, score desc, wrong_count asc, created_at asc
) best;

grant select on public.suni_tohumlama_vy_board to anon, authenticated;

-- ------------------------------------------------------------
-- ÖĞRETİM ELEMANI İÇİN SORGULAR (SQL Editor'de tam veriyi görür)
-- ------------------------------------------------------------
-- Sınıfın tam listesi (her öğrencinin en iyi puanı, numara açık):
--
--   select distinct on (student_no)
--          student_no, first_name, last_name, score, correct_count,
--          wrong_count, missed_count, finished, created_at
--   from public.suni_tohumlama_vy_scores
--   where group_code = 'vet2026guz'
--   order by student_no, score desc;
--
-- Dersten sonra tabloyu sıfırlamak (DİKKAT: geri alınamaz):
--
--   delete from public.suni_tohumlama_vy_scores where group_code = 'vet2026guz';
