import { config as loadEnv } from 'dotenv';
import { Client } from 'pg';

loadEnv({ path: '.env.local' });

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const email = process.env.QA_ADMIN_EMAIL?.trim();
  const { rows } = await client.query(
    `update public.profiles set role = 'admin' where email = $1 returning id, email, role`,
    [email],
  );
  if (rows.length === 0) {
    console.error(`❌ ${email} bulunamadı`);
    process.exit(1);
  }
  console.log('✅ Admin yapıldı:', rows[0]);
  await client.end();
}

main();
