# Faz 15B — Supabase Storage + Image Upload Plan

> **Status:** Sıra geldiğinde detaya genişletilecek.

**Goal:** Admin'in ürün/proje görsellerini cihazından (drag-drop) veya URL'den yükleyebilmesi. Supabase Storage. (Cloudinary sonra eklenecek.)

**Architecture:**
- Bucket: `media` (public read, admin write — RLS policy via `is_admin()`)
- Path: `media/products/{id}/{uuid}.jpg`, `media/projects/{id}/{uuid}.jpg`, `media/campaigns/{id}/{uuid}.jpg`
- Upload component: drag-drop + click + URL fallback
- Storage SDK: `@supabase/supabase-js` (zaten var)

**Tasks (8):**

1. **Migration v12 + storage bucket** — `0014_storage_policies.sql`:
   ```sql
   -- bucket'i ayrıca dashboard'dan yarat (`media`, public)
   -- sonra:
   create policy "media_public_read" on storage.objects
     for select using (bucket_id = 'media');
   create policy "media_admin_write" on storage.objects
     for insert using (bucket_id = 'media' and public.is_admin())
     with check (bucket_id = 'media' and public.is_admin());
   create policy "media_admin_update" on storage.objects
     for update using (bucket_id = 'media' and public.is_admin());
   create policy "media_admin_delete" on storage.objects
     for delete using (bucket_id = 'media' and public.is_admin());
   ```

2. **`lib/storage/upload.ts`** — yardımcı:
   ```ts
   export async function uploadFile(file: File, path: string): Promise<{ url: string } | { error: string }>
   export async function deleteFile(path: string): Promise<void>
   ```

3. **`<ImageUploader>` component** (client):
   - Drag-drop zone (`react-dropzone` ya da native HTML5)
   - URL input fallback ("Veya URL ile ekle")
   - Multi-file desteği
   - Upload progress bar
   - Preview thumbnail
   - Delete buton

4. **`<ImageGallery>` component** — upload edilmişlerin yönetimi (sıra değiştir, sil)

5. **Product form entegrasyonu** — `components/admin/product-form.tsx`'de mevcut text-input ArrayField'ları `<ImageUploader>` ile değiştir

6. **Project form entegrasyonu** — aynı şekilde

7. **Tests** — uploadFile mock'lu unit, ImageUploader render testi

8. **Completion report**

**Bilinen riskler:**
- Storage RLS hatası → upload başarılı görünür ama policy tarafından reddedilir → açık hata mesajı göster
- File size limit (default 50MB Supabase) — UI 5MB cap koy, validate
- Image type whitelist: jpg/png/webp only

**Faz 15B sonrası:** Faz 15A'da kullanılan Unsplash placeholder'larını kullanıcı kendi yükledikleriyle değiştirebilir.
