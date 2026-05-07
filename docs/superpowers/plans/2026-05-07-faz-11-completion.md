# Faz 11 — Tedarikçi Sync (Cheerio + Cron) — Completion Report

**Tarih:** 2026-05-07
**Plan:** `docs/superpowers/plans/2026-05-07-faz-11-tedarikci-sync.md` (9 task)
**Commit aralığı:** `3d88495 → 9b6ddf5` (8 feat commit + 1 doc commit)
**Test:** 219/219 (Vitest, 65 dosya) — Faz 10 sonu 198'di, +21 yeni test
**Build:** Temiz (Next.js 16.2.4 Turbopack)

## Tamamlanan Task'lar

| # | Task | Commit | Yeni test |
|---|---|---|---|
| 1 | DB migration: suppliers + supplier_products | `3d88495` | — |
| 2 | fetchHtml utility (cheerio + native fetch) | `adaac29` | 4 |
| 3 | Adapter interface + ExampleAdapter + registry | `fcaa674` | 5 |
| 4 | Sync runner (diff + notification + DB update) | `2744b8c` | 8 |
| 5 | Daily summary admin e-posta template | `7bc2892` | 4 |
| 6 | Admin tedarikçiler UI + manual sync | `5819bb9` | — |
| 7 | Vercel cron route + summary e-posta | `fb73f42` | — |
| 8 | CLI wrapper (`npm run sync:run`) | `9b6ddf5` | — |
| 9 | Verifikasyon + bu rapor | (bu commit) | — |

## Yeni Yetenekler

### 1. Tedarikçi sistemi
- `suppliers` tablosu: tedarikçi listesi + adapter eşleşmesi
- `supplier_products` tablosu: ürün × tedarikçi mapping (last_price, last_stock, last_synced_at, last_error)
- RLS: sadece admin

### 2. Adapter pattern
- `lib/suppliers/adapter-types.ts` → `SupplierAdapter` interface
- `lib/suppliers/registry.ts` → slug → adapter map
- `lib/suppliers/adapters/example.ts` → test fixture'lı örnek adapter
- Yeni gerçek tedarikçi eklemek için: yeni `adapters/<slug>.ts` + registry'e satır

### 3. Sync motoru
- `syncSupplier(id)`: fetchHtml → adapter.parseProduct → diff
- **PRICE_INCREASE / PRICE_DECREASE** notification: |diff| ≥ %5
- **OUT_OF_STOCK** notification: oldStock > 0 && newStock = 0
- **BACK_IN_STOCK**: changes'a düşer ama notification yaratmaz (mevcut stock_alerts hook'u kullanıcı bildirimini hâlâ atıyor)
- Per-item try/continue: tek hata tüm sync'i bozmaz
- last_error + last_synced_at her ürün için izleniyor

### 4. Admin UI
- `/admin/tedarikciler` listing (her satırda anlık "Sync et" butonu)
- `/admin/tedarikciler/yeni` ekleme formu
- `/admin/tedarikciler/[id]` düzenleme + bağlı ürünler tablosu + last_sync_error banner
- Sidebar'a "Tedarikçiler" menü linki (Truck ikonu)

### 5. Otomasyon
- Vercel Cron: günlük 06:00 UTC (09:00 TRT) → `/api/cron/sync-suppliers`
- `CRON_SECRET` Bearer auth
- E-posta sadece alert/error varsa gönderilir (spam yok)
- CLI alternatif: `npm run sync:run` (lokal test için)

## Yeni Routes

```
/admin/tedarikciler              — Liste
/admin/tedarikciler/yeni         — Yeni
/admin/tedarikciler/[id]         — Düzenle
/api/cron/sync-suppliers         — Vercel cron endpoint (Bearer auth)
```

## DB Şema Değişiklikleri

`combined_for_paste_v10.sql` — `npm run db:apply` ile otomatik uygulandı:

```sql
suppliers (id, slug, name, base_url, adapter_slug, enabled, last_synced_at, last_sync_error, created_at)
supplier_products (id, supplier_id, product_id, supplier_url, last_price, last_stock, last_synced_at, last_error, created_at)
```

RLS: ikisinde de `is_admin()` policy'si.

## ⚠️ Kullanıcı Aksiyonları (gerekiyor)

### 1. CRON_SECRET üret + .env.local'a ekle
```powershell
# PowerShell'de rastgele secret üret:
[System.BitConverter]::ToString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)).Replace('-','').ToLower()
```
Sonra `.env.local`'a:
```
CRON_SECRET=<üretilen-secret>
```

### 2. Production deploy (Vercel'e)
Cron yalnızca Vercel'de çalışır. `vercel.json` zaten config'i içeriyor. Deploy ederken Vercel `CRON_SECRET` env'ini de production'a koymanız gerekir.

### 3. İlk tedarikçiyi ekle (UI üzerinden)
- `/admin/tedarikciler/yeni` → ExampleAdapter ile test bir tedarikçi
- Bağlı ürünler için şimdilik DB doğrudan: `supplier_products` tablosuna manuel insert (Faz 12+'da UI eklenebilir)

### 4. Manuel test
```powershell
# Terminal 1: dev server zaten çalışıyor
# Terminal 2:
npm run sync:run
```

## Mimari Kararlar

1. **Cheerio (statik HTML), Playwright değil** — basit, hızlı. JS-rendered siteler için Faz 12+'da Playwright düşünülebilir.
2. **Kod-tabanlı adapter, data-tabanlı değil** — DOM selector'ları kodda. Yeni tedarikçi = yeni adapter dosyası + registry kaydı.
3. **DB-tracked migration runner** — `_migrations_applied` tablosu sayesinde idempotent.
4. **Notifications mevcut tablodan** — yeni tablo değil; type union zaten `PRICE_INCREASE | PRICE_DECREASE | OUT_OF_STOCK | SUPPLIER_GONE` içeriyordu.
5. **Best-effort e-posta** — Sync'in kendisi hatalardan etkilenmez; e-posta da `Promise` zincirinde.
6. **`is_admin()` SECURITY DEFINER ile RLS** — supplier tabloları için aynı pattern kullanıldı (Faz 10'dan).

## Sayılar

- **Commit:** 9 (8 feat + 1 docs)
- **Yeni dosya:** 22 (8 lib + 5 admin + 4 page + 5 test/fixture)
- **Değiştirilen dosya:** 6 (types, sidebar, .env.example, package.json, db-check, package-lock)
- **Yeni test:** 21 (4+5+8+4)
- **Toplam test:** 219/219
- **Yeni route:** 4 (3 admin + 1 cron API)
- **Build:** Temiz

## Bilinen Sınırlamalar

- **`supplier_products` ekleme UI'sı yok** — şu an DB direkt insert. Faz 12+'da admin UI eklenebilir.
- **ExampleAdapter sadece test fixture'ı için** — gerçek tedarikçi adapter'ı yazılmadı. Kullanıcı seçtiği bayi için yeni adapter ekleyecek.
- **Per-domain rate limiting yok** — aynı domain'e ardışık istekleri yavaşlatma yok. Düşük volüm sürecinde sorun değil.
- **robots.txt riayet kontrolü yok** — yasal risk düşük (kamuya açık fiyat) ama nezaketsiz; gelecekte eklenebilir.
- **Adapter health monitoring yok** — 3 ardışık fail → otomatik enabled=false yok. Manuel takip gerekli.
- **Diff history yok** — sadece son değer saklanıyor; historical price tracking için ayrı tablo gerekli.
- **JS-rendered siteler desteklenmiyor** — Playwright/Puppeteer yok.

## Sonraki Faz

**Faz 12** — Recharts admin dashboard. Plan: `docs/superpowers/plans/2026-05-07-faz-12-admin-charts.md` (yapısal taslak — sıra gelince Faz 11 detay seviyesinde genişletilecek).
