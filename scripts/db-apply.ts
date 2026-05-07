/**
 * scripts/db-apply.ts
 *
 * Migration runner — runs combined_for_paste_*.sql files against Supabase
 * via direct PostgreSQL connection.
 *
 * Tracks applied migrations in `_migrations_applied` table so each file
 * runs exactly once. Files themselves are idempotent (if not exists / etc.)
 * so re-running a file by mistake is harmless, but the tracker spares the
 * round trip.
 *
 * Usage:
 *   npm run db:apply              # applies all pending combined_for_paste_v*.sql
 *   npm run db:apply -- v9        # applies only that one file
 *
 * Reads DATABASE_URL from .env.local. Uses simple-query protocol (no
 * prepared statements) so it works with both direct + transaction pooler.
 */

import { config as loadEnv } from 'dotenv';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';

// .env.local'i öncelikli yükle, sonra .env (varsa)
loadEnv({ path: '.env.local' });
loadEnv();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('❌ DATABASE_URL .env.local içinde tanımlı değil.');
    process.exit(1);
  }

  const arg = process.argv[2]; // örn "v9" veya yok

  const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
  const allFiles = readdirSync(migrationsDir)
    .filter((f) => /^combined_for_paste_v\d+\.sql$/.test(f))
    .sort((a, b) => {
      const va = parseInt(a.match(/v(\d+)/)![1]!, 10);
      const vb = parseInt(b.match(/v(\d+)/)![1]!, 10);
      return va - vb;
    });

  let targetFiles: string[];
  if (arg) {
    const match = allFiles.find((f) => f.includes(`_${arg}.`));
    if (!match) {
      console.error(`❌ "combined_for_paste_${arg}.sql" bulunamadı.`);
      console.error(`   Mevcut: ${allFiles.join(', ')}`);
      process.exit(1);
    }
    targetFiles = [match];
  } else {
    targetFiles = allFiles;
  }

  const client = new Client({
    connectionString: url,
    // Transaction pooler ile uyumlu olması için prepared statement'ları kapat.
    // pg client.query(sql) zaten parametre yokken simple-query kullanır,
    // bu sadece güvence olarak.
    statement_timeout: 0,
  });

  console.log(`🔌 Bağlanıyor: ${url.replace(/:[^@]+@/, ':****@')}`);
  await client.connect();
  console.log('✅ Bağlandı.');

  // Tracker tablosu
  await client.query(`
    create table if not exists public._migrations_applied (
      filename text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  const { rows: appliedRows } = await client.query(
    'select filename from public._migrations_applied'
  );
  const applied = new Set(appliedRows.map((r) => r.filename as string));

  let didRun = false;
  for (const file of targetFiles) {
    if (applied.has(file)) {
      console.log(`⏭️  ${file} → zaten uygulandı, atlanıyor`);
      continue;
    }
    const path = join(migrationsDir, file);
    const sql = readFileSync(path, 'utf8');
    console.log(`▶️  ${file} çalıştırılıyor (${sql.length} karakter)...`);
    try {
      await client.query(sql);
      await client.query(
        'insert into public._migrations_applied(filename) values ($1) on conflict do nothing',
        [file]
      );
      console.log(`✅ ${file} başarılı.`);
      didRun = true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`❌ ${file} HATA: ${msg}`);
      await client.end();
      process.exit(1);
    }
  }

  if (!didRun && !arg) {
    console.log('🎉 Bekleyen migration yok, her şey güncel.');
  }

  await client.end();
}

main().catch((e) => {
  console.error('❌ Çalıştırma hatası:', e);
  process.exit(1);
});
