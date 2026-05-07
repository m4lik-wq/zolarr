/** Hızlı doğrulama: tablolar + kolonlar + trigger'lar mevcut mu? */
import { config as loadEnv } from 'dotenv';
import { Client } from 'pg';

loadEnv({ path: '.env.local' });

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const { rows } = await client.query(`
    select
      to_regclass('public.profiles')         is not null as profiles,
      to_regclass('public.notifications')    is not null as notifications,
      exists (select 1 from information_schema.columns
        where table_schema='public' and table_name='profiles' and column_name='email_preferences'
      ) as email_prefs_col,
      exists (select 1 from information_schema.columns
        where table_schema='public' and table_name='profiles' and column_name='unsubscribe_secret'
      ) as unsubscribe_col,
      exists (select 1 from pg_proc p join pg_namespace n on p.pronamespace=n.oid
        where n.nspname='public' and p.proname='is_admin'
      ) as is_admin_fn,
      (select count(*) from information_schema.triggers
        where trigger_schema='public' and trigger_name in (
          'trg_notify_new_quote','trg_notify_new_dealer','trg_notify_new_contact'
        )) as trigger_count;
  `);
  console.log('DB durumu:', rows[0]);
  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
