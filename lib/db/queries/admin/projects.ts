import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/server';
import { mapProjectRow, type ProjectRow } from '@/lib/db/queries/projects-helpers';
import type { Project } from '@/lib/db/types';

export async function listAdminProjects(): Promise<Project[]> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error || !data) return [];
  return (data as ProjectRow[]).map(mapProjectRow);
}

export async function getAdminProject(id: string): Promise<Project | null> {
  await requireAdmin();
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return mapProjectRow(data as ProjectRow);
}
