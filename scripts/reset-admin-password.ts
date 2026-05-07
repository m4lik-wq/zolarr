/**
 * Tek seferlik: admin kullanıcının şifresini Supabase admin API ile günceller.
 * Kullanım: npx tsx scripts/reset-admin-password.ts
 *
 * .env.local'dan SUPABASE_SERVICE_ROLE_KEY ve QA_ADMIN_EMAIL/PASSWORD okur.
 */
import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

loadEnv({ path: '.env.local' });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const email = process.env.QA_ADMIN_EMAIL?.trim();
  const password = process.env.QA_ADMIN_PASSWORD?.trim();

  if (!url || !key || !email || !password) {
    console.error('❌ Eksik env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, QA_ADMIN_EMAIL, QA_ADMIN_PASSWORD');
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { persistSession: false } });

  // Email ile kullanıcıyı bul
  console.log(`🔍 ${email} kullanıcı aranıyor...`);
  const { data, error } = await sb.auth.admin.listUsers();
  if (error) {
    console.error('❌ listUsers failed:', error);
    process.exit(1);
  }

  const user = data.users.find((u) => u.email === email);
  if (!user) {
    console.error(`❌ ${email} bulunamadı`);
    process.exit(1);
  }

  console.log(`✅ Bulundu (id: ${user.id})`);
  console.log(`   Email confirmed: ${user.email_confirmed_at ? 'evet' : 'HAYIR'}`);
  console.log('🔐 Şifre güncelleniyor + e-posta onaylanıyor...');
  const { error: updErr } = await sb.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
  });
  if (updErr) {
    console.error('❌ Şifre güncellenemedi:', updErr);
    process.exit(1);
  }

  console.log(`✅ Şifre güncellendi: ${email} → ${'•'.repeat(password.length)}`);
  console.log('✅ E-posta onaylandı (eğer önceden onaylanmamışsa).');
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
