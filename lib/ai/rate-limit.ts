import 'server-only';
import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export const ANON_DAILY_LIMIT = 10;

const RATE_LIMIT_SALT = 'zolarr-ai-2026-05';

export function hashIp(ip: string): string {
  return createHash('sha256').update(`${RATE_LIMIT_SALT}:${ip}`).digest('hex');
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env eksik');
  return createClient(url, key, { auth: { persistSession: false } });
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
}

// Mesaj göndermeden ÖNCE çağrılır. Limit dolmuşsa allowed=false döner ve sayaç artmaz.
export async function checkAndIncrement(ip: string): Promise<RateLimitResult> {
  const ipHash = hashIp(ip);
  const day = todayUtc();
  const supabase = adminClient();

  const { data: existing, error: fetchError } = await supabase
    .from('ai_chat_usage')
    .select('message_count')
    .eq('ip_hash', ipHash)
    .eq('day', day)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Rate limit okunamadı: ${fetchError.message}`);
  }

  const current = existing?.message_count ?? 0;
  if (current >= ANON_DAILY_LIMIT) {
    return { allowed: false, remaining: 0, limit: ANON_DAILY_LIMIT };
  }

  const next = current + 1;
  const { error: upsertError } = await supabase.from('ai_chat_usage').upsert({
    ip_hash: ipHash,
    day,
    message_count: next,
    updated_at: new Date().toISOString(),
  });

  if (upsertError) {
    throw new Error(`Rate limit yazılamadı: ${upsertError.message}`);
  }

  return { allowed: true, remaining: ANON_DAILY_LIMIT - next, limit: ANON_DAILY_LIMIT };
}

export function extractIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return '0.0.0.0';
}
