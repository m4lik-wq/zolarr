/**
 * Direct Supabase signInWithPassword test — bypass Playwright/UI.
 */
import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

loadEnv({ path: '.env.local' });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const email = process.env.QA_ADMIN_EMAIL?.trim();
  const password = process.env.QA_ADMIN_PASSWORD?.trim();
  if (!url || !anonKey || !email || !password) {
    console.error('Eksik env');
    process.exit(1);
  }
  console.log('Email:', JSON.stringify(email));
  console.log('Password:', JSON.stringify(password), `(uzunluk: ${password.length})`);
  const sb = createClient(url, anonKey);
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('❌ Login fail:', error.message);
  } else {
    console.log('✅ Login başarılı! User:', data.user?.email);
    console.log('   Session var:', Boolean(data.session));
  }
}

main();
