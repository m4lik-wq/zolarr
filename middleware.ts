import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PROTECTED_PREFIXES = ['/hesap'];
const GUEST_ONLY = ['/giris', '/kayit', '/sifremi-unuttum'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(toSet) {
          toSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;

  if (PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`)) && !user) {
    const url = req.nextUrl.clone();
    url.pathname = '/giris';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  if (user && GUEST_ONLY.some((p) => path === p)) {
    const url = req.nextUrl.clone();
    url.pathname = '/hesap';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    '/hesap',
    '/hesap/:path*',
    '/giris',
    '/kayit',
    '/sifremi-unuttum',
  ],
};
