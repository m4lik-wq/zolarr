# Faz 10 — Bildirim Genişletme + KVKK Polish — Completion Report

**Tarih:** 2026-05-07
**Plan:** `docs/superpowers/plans/2026-05-07-faz-10-bildirim-kvkk.md` (12 task; Task 11 opsiyoneldi, atlandı)
**Commit aralığı:** `ecd5002 → 647e930` (10 feat commit + 1 doc commit)
**Test:** 198/198 (Vitest, 61 dosya) — Faz 9 sonu 178'di, +20 yeni test
**Build:** Temiz (Next.js 16.2.4 Turbopack)

## Tamamlanan Task'lar

| # | Task | Commit | Yeni test |
|---|---|---|---|
| 1 | DB migration: email_preferences + unsubscribe_secret | `ecd5002` | — |
| 2 | Email preference + HMAC unsubscribe helpers | `086cadc` | 9 |
| 3 | Quote durum e-postası + update-quote hook | `a135087` | 5 |
| 4 | Dealer durum e-postası + update-dealer hook | `43f8d41` | 3 |
| 5 | Stock alert e-postası + product update hook | `8445b1a` | 3 |
| 6 | E-posta tercihleri UI (/ayarlar/eposta) | `6ba01fe` | — |
| 7 | Tek-tıkla unsubscribe endpoint (/eposta/cik) | `45015c5` | — |
| 8 | KVKK Verilerimi indir (JSON export) | `cff7b64` | — |
| 9 | KVKK Hesabımı sil (anonymize + delete) | `b546509` | — |
| 10 | KVKK Aydınlatma Metni (/kvkk) | `647e930` | — |
| 11 | (Realtime bell — atlandı) | — | — |
| 12 | Verifikasyon + bu rapor | (bu commit) | — |

## Yeni Routes (8 sayfa + 1 API)

```
/ayarlar/eposta              — Kullanıcı e-posta tercihleri (4 kategori)
/eposta/cik?token=...        — Tek-tıkla abonelikten çık
/hesap/kvkk                  — KVKK işlem hub'ı (verileri indir / hesap sil)
/hesap/kvkk/sil              — Hesap silme onay sayfası
/kvkk                        — KVKK aydınlatma metni (public)
/api/kvkk/verilerimi-indir   — JSON export endpoint (auth gerekli)
```

## Yeni Yetenekler

### 1. E-posta tercihleri (kullanıcı bazlı opt-out)
- **4 kategori:** marketing, stock_alerts, quote_status, dealer_status
- **Default:** hepsi açık (opt-in)
- Kullanıcı `/ayarlar/eposta`'dan kapatabilir
- Tek-tıkla unsubscribe linki (token-bazlı, HMAC ile imzalı)
- Onay e-postaları (kayıt, teklif alındı vb.) tercih bağımsız (transaksiyonel)

### 2. Status değişimi e-postaları
- **Quote durum:** new → contacted → quoted → won/lost. Her geçişte müşteriye Türkçe e-posta. Won/lost'ta admin notu varsa dahil edilir.
- **Dealer durum:** new → reviewing → approved/rejected. Onaylanırsa kutlama, reddedilirse açıklama.
- **Stock alert:** ürün stok 0 → pozitif geçişinde, kayıtlı kullanıcılara bildirim. `stock_alerts.notified=true` set edilir (idempotency).

### 3. KVKK uyumlu kullanıcı hakları
- **Verilerimi indir (Madde 11/g):** GET `/api/kvkk/verilerimi-indir` → JSON download. Profil + adresler + favoriler + stok uyarıları + teklif geçmişi.
- **Hesabımı sil (Madde 11/e):** İki adımlı onay (`HESABIMI SİL` yazma) → quotes anonimleşir → auth.users CASCADE delete.
- **Aydınlatma metni:** `/kvkk` (public) — veri sorumlusu, kategoriler, amaçlar, aktarım, saklama süreleri, kullanıcı hakları.

## DB Şema Değişiklikleri

`combined_for_paste_v9.sql` ile uygulanır (idempotent):

```sql
-- profiles tablosuna iki yeni kolon
email_preferences jsonb not null default '{
  "marketing": true,
  "stock_alerts": true,
  "quote_status": true,
  "dealer_status": true
}'::jsonb;

unsubscribe_secret text not null default encode(gen_random_bytes(16), 'hex');
```

⚠️ **Kullanıcı yapacak:** v9 dosyasını Supabase Studio SQL Editor'a yapıştırıp Run.

## Güvenlik Notları

- **HMAC unsubscribe token:** SHA-256 + 32-char prefix + `timingSafeEqual` (constant-time comparison)
- **Per-user secret:** Her profilin kendi `unsubscribe_secret`'i — bir kullanıcının token'ı diğerinde geçmez
- **`requireAdmin` / `requireUser`:** Tüm action'larda ilk satır
- **Admin client (service role) kullanımı:** Sadece KVKK delete (auth.admin.deleteUser) ve unsubscribe (RLS bypass profile read)
- **escapeHtml her şablonda:** Müşteri/admin kullanıcı girdileri sızdırılmadan render edilir

## Sayılar

- **Commit:** 11 (10 feat + 1 docs)
- **Yeni dosya:** 19
- **Değiştirilen dosya:** 5 (2 helper + 3 admin action)
- **Yeni test:** 20
- **Toplam test:** 198/198
- **Yeni route:** 8 (5 page + 3 API/server-action)
- **Build:** Temiz

## Manuel Test Adımları (kullanıcı)

⚠️ Önce `combined_for_paste_v9.sql`'i Supabase'de çalıştırın.

1. **E-posta tercihleri:** `/ayarlar/eposta` → bir kategoriyi kapat → Kaydet → o kategoriden e-posta gelmemeli
2. **Quote status:** Admin panelde bir teklifin status'unu değiştir → müşteriye Türkçe e-posta?
3. **Dealer status:** Bayi başvurusunu approve/reject yap → bayiye e-posta?
4. **Stock alert:** Ürünün stoğunu 0 → 5 yap (kayıtlı stok uyarısı varsa) → e-posta?
5. **Unsubscribe:** Bir e-postada gelen `/eposta/cik?token=...` linkine tıkla → tercih kapanmalı
6. **Verilerimi indir:** `/hesap/kvkk` → İndir butonuna tıkla → JSON inmeli
7. **Hesap sil:** `/hesap/kvkk/sil` → "HESABIMI SİL" yaz → onayla → hesap silinmeli, ana sayfaya redirect

## Bilinen Sınırlamalar

- **Token expiry yok:** Unsubscribe linki süresiz geçerli. Genelde sorun değil ama kötü niyetli kişi token'ı saklayıp ileride kullanabilir → çözüm: token içine timestamp ekle, 30 gün limit. Şimdilik atlandı (low risk).
- **Mevcut e-posta şablonlarında unsubscribe linki yok:** Footer'a `renderEmail({ unsubscribe })` opsiyonu eklendi ama eski şablonlar henüz pass etmiyor. Faz 10.5 veya Faz 11'de retrofit yapılabilir.
- **Welcome + Supabase confirm çift e-posta:** Faz 9'dan kalan sorun, çözülmedi.
- **Hesap silme audit logu yok:** Silme işlemi DB'ye loglanmıyor. Gerekiyorsa `account_deletions` tablosu eklenebilir.
- **Realtime notification bell (Task 11):** Atlandı — şimdilik static load yeterli. Faz 13 (RAG) öncesi tekrar değerlendirilebilir.

## Sonraki Faz

**Faz 11** — Tedarikçi sync (cheerio + cron). Plan: `docs/superpowers/plans/2026-05-07-faz-11-tedarikci-sync.md` (yapısal taslak — sıra gelince Faz 10 detay seviyesinde genişletilecek).
