import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { mapProjectRow, type ProjectRow } from './projects-helpers';
import type { Project } from '../types';

export async function listProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('[listProjects] error:', error);
    return [];
  }
  return (data as ProjectRow[]).map(mapProjectRow);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error || !data) return null;
  return mapProjectRow(data as ProjectRow);
}

export async function listRelatedProjects(
  type: Project['type'],
  excludeSlug: string,
  limit = 3
): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .eq('type', type)
    .neq('slug', excludeSlug)
    .order('sort_order', { ascending: true })
    .limit(limit);
  if (error || !data) return [];
  return (data as ProjectRow[]).map(mapProjectRow);
}
