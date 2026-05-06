import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/db/types';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,name,phone,role,avatar_url,created_at,updated_at')
    .eq('id', user.id)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    phone: data.phone,
    role: data.role,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  return user;
}

export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === 'admin';
}
