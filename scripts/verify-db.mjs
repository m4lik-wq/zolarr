// Faz 3 — DB doğrulama scripti.
// Service role key kullanır; sadece local kontrol içindir, repoya commit edilse bile env dosyasındaki sırrı göstermez.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFromLocal() {
  const path = resolve(process.cwd(), '.env.local');
  const text = readFileSync(path, 'utf8');
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^"|"$/g, '');
  }
  return env;
}

const env = loadEnvFromLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Eksik env: NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const cats = await supabase.from('categories').select('*', { count: 'exact', head: true });
const prods = await supabase.from('products').select('*', { count: 'exact', head: true });
const featured = await supabase.from('products').select('slug,name,price,is_featured').eq('is_featured', true).limit(3);

console.log('Categories:', cats.error ? `ERROR ${cats.error.message}` : `${cats.count} satır`);
console.log('Products:', prods.error ? `ERROR ${prods.error.message}` : `${prods.count} satır`);
console.log('Featured örnekleri:', featured.error ? `ERROR ${featured.error.message}` : featured.data);
