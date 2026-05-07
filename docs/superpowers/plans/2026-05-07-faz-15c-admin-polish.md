# Faz 15C — Shopify-style Admin Polish Plan

> **Status:** Sıra geldiğinde detaya genişletilecek.

**Goal:** Admin paneline "Shopify hissi" ver — daha bilgili dashboard, hızlı tablo işlemleri, illüstrasyonlu empty state'ler, polish.

**Tasarım dili:**
- Shopify referans: net hiyerarşi, çok iç boşluk, sparkline'lar, badge yoğun, hızlı eylem (cmd+k)
- Mevcut admin layout korunur, içeriği zenginleştir

**Tasks (10-12 öngörü):**

1. **Dashboard v2:**
   - "Bugün" sparkline strip (mini chart'lar)
   - "Son 7 gün vs önceki 7 gün" % change
   - Quick actions kartı ("+ Yeni ürün", "+ Yeni kampanya", "+ Stok yükle")
   - Recent activity feed (notification log + son işlemler)

2. **Tablo iyileştirmeleri (Shopify kalıbı):**
   - Üstte search input + filter chip'leri (active filters görünür)
   - Bulk select + bulk actions ("Sil", "Yayından kaldır", "Etiket ekle")
   - Pagination (20/sayfa default)
   - Sort columns (clickable headers)
   - Per-row hover quick actions (edit, sil, kopyala)

3. **Empty states:**
   - Her ana tablo için ("henüz ürün yok", "henüz teklif yok") illüstrasyonlu boş durum
   - Büyük CTA buton + helpful tip
   - Lucide-react geometric ikon büyük render

4. **Quick action menu (3-dot dropdown her satırda):**
   - Düzenle, Görüntüle, Kopyala, Sil
   - Radix DropdownMenu (zaten var)

5. **Cmd+K command palette:**
   - Ctrl+K / Cmd+K ile açılan arama
   - Sayfa navigation + son ürünler + son teklifler
   - Optional task — komplekt değilse Faz 15D'ye

6. **Notification center polish:**
   - Header bell tıklanınca dropdown (şu an /admin'e link)
   - Inline mark-as-read
   - Filter (sadece okunmamışlar)

7. **Form polish:**
   - Tab'lı form (Basic / Media / SEO / Advanced) — Shopify product editor gibi
   - Save bar (sticky bottom: "Kaydet | Vazgeç")
   - "Last saved" indicator

8. **Onboarding hint'leri:**
   - İlk kullanıcı için "Öncelikle ürün ekle" tooltip'leri
   - Dismiss edilebilir

9. **Page header standardizasyonu:**
   - Tüm admin sayfalarında consistent başlık + breadcrumb + ana CTA

10. **Detail page polish:**
    - Sidebar kart'lar (Quick Stats, Tags, Activity Log)
    - Status badge prominent
    - "Son düzenleme" timestamp

11. **Tests + completion report**

**Bilinen riskler:**
- Cmd+K tüm sayfalarda overlay olduğu için keyboard shortcut conflict riski → modal scoped to /admin
- Bulk actions transaction güvenliği — single-shot mu batch mi (UX'te animation göster)
- Form tab navigation: query string mi state mi (URL paylaşılabilirlik için query string daha iyi)
