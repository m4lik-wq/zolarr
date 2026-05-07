import { NextResponse } from 'next/server';
import { getCurrentUser, getCurrentProfile } from '@/lib/auth/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
  const profile = await getCurrentProfile();
  const sb = await createClient();
  const [addresses, favorites, stockAlerts, quotes] = await Promise.all([
    sb.from('addresses').select('*').eq('user_id', user.id),
    sb.from('favorites').select('*').eq('user_id', user.id),
    sb.from('stock_alerts').select('*').eq('user_id', user.id),
    sb.from('quotes').select('*').eq('user_id', user.id),
  ]);
  const data = {
    exported_at: new Date().toISOString(),
    note: 'Bu dosya Zolarr hesabınıza ait tüm kullanıcı verilerini içerir. KVKK Madde 11 (g) gereği talep üzerine sağlanmıştır.',
    user: { id: user.id, email: user.email },
    profile,
    addresses: addresses.data ?? [],
    favorites: favorites.data ?? [],
    stock_alerts: stockAlerts.data ?? [],
    quotes: quotes.data ?? [],
  };
  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="zolarr-verileriniz-${user.id}.json"`,
      'cache-control': 'no-store',
    },
  });
}
