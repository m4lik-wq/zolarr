import { config as loadEnv } from 'dotenv';
import { Client } from 'pg';

loadEnv({ path: '.env.local' });

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const email = process.env.QA_ADMIN_EMAIL?.trim();
  const { rows } = await client.query(
    `select id, email, role, created_at from public.profiles where email = $1`,
    [email],
  );
  console.log('Profile:', rows[0] ?? 'YOK');
  await client.end();
}

main();
