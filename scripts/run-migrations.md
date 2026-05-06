# Migrations'ı çalıştırma

Bu projede Drizzle yerine düz SQL migration dosyaları kullanıyoruz.
Sırayla `supabase/migrations/` altındakileri Supabase Studio'da çalıştırın:

1. Supabase Dashboard → Project → SQL Editor → "New query"
2. Aşağıdaki sırayla içerikleri yapıştırın ve "Run" deyin:
   - `0001_categories_products.sql`
   - `0002_seed_categories.sql`
   - `0003_seed_products.sql`
3. Doğrulama:
   ```sql
   select count(*) from public.products;   -- 28 olmalı
   select count(*) from public.categories; -- 25 olmalı (6 üst + 19 alt)
   ```

## Sıra önemli

- `0001` tablo şemasını (categories + products + indexler + RLS) kurar.
- `0002` 6 ana + 19 alt kategoriyi ekler. `0001`'siz çalışmaz.
- `0003` 28 örnek ürünü ekler ve `category_id`'yi slug üzerinden join ile çözer.
  `0002`'siz hiçbir ürün doğru kategoriye bağlanamaz.

## Tekrar çalıştırma

Migration'lar `IF NOT EXISTS` / `ON CONFLICT DO NOTHING` ile yazıldı; aynı script'i
ikinci kez çalıştırmak güvenlidir. Şemayı sıfırlamak isterseniz Supabase Studio
SQL Editor'da:

```sql
drop table if exists public.products cascade;
drop table if exists public.categories cascade;
```

sonra 0001 → 0003'ü tekrar uygulayın.

## Not

Faz 4'te (Teklif sistemi) yeni migration'lar gelecek; aynı yöntemle uygulanacak.
