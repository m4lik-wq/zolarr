# Faz 7 — Auth & Hesap: Completion Report

**Tarih:** 2026-05-06
**Branch:** master
**Plan:** docs/superpowers/plans/2026-05-06-faz-7-auth-hesap.md

## Özet

Supabase Auth ile e-posta+şifre kimlik doğrulaması. /giris, /kayit, şifre sıfırlama
akışları, korumalı /hesap dashboard'u (profil, teklifler, favoriler, bildirimler).
Header'a kullanıcı menüsü ve admin gizli butonu eklendi. AI rate-limit kayıtlı
kullanıcılarda 50/güne yükseltildi (anonim 10/gün korundu). /ayarlar sayfasında
"Hesap Bilgileri" ve "Bildirimler" bölümleri artık giriş yapmış kullanıcıları
/hesap/profil ve /hesap/bildirimler sayfalarına yönlendiriyor; misafir kullanıcılara
/giris sayfasına yönlendirme gösteriliyor.

## Sayılar

- Görev: 19
- Commit: 18 (plan commit'i hariç)
- Değişen dosya: 50
- Eklenen satır: 4376 / silinen: 45
- Test: 154 / 154 ✅
- TypeScript: temiz
- Build: temiz
- Yeni rota: 10

## Yeni rotalar

- `/giris` — e-posta + şifre giriş
- `/kayit` — kayıt + e-posta onay yönlendirmesi
- `/sifremi-unuttum` — şifre sıfırlama linki gönderimi
- `/sifre-yenile` — yeni şifre belirleme
- `/auth/callback` — Supabase email confirm + reset callback
- `/hesap` — dashboard (özet kartlar)
- `/hesap/profil` — ad, soyad, telefon düzenleme
- `/hesap/teklifler` — kullanıcının teklif geçmişi
- `/hesap/favoriler` — favori ürünler listesi
- `/hesap/bildirimler` — stok aboneliği yönetimi

## Bilinen sınırlamalar

- /admin sayfaları → Faz 8'de
- Sipariş takibi (/hesap/siparisler, /siparis-takibi/[id]) → Faz 8 (orders/checkout)
- Google OAuth → ileride
- Verilerimi indir / Hesabımı sil → Faz 10 (KVKK polish)
- Push bildirim teslimi → Faz 9 (web-push)

## Kullanıcı eylemi gerekli

1. `supabase/migrations/combined_for_paste_v5.sql`'i Supabase Studio SQL Editor'a
   yapıştırıp Run — `profiles`, `addresses`, `favorites`, `stock_alerts` tabloları
   ve `quotes.user_id` kolonu.
2. Supabase Studio → Authentication → Providers → Email aktif mi kontrol et.
3. (Opsiyonel) Authentication → Email Templates → "Confirm signup" + "Reset password"
   şablonlarını Türkçeleştir.
