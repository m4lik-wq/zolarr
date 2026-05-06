import type { Project } from '../types';

export interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  type: 'konut' | 'ticari' | 'tarim';
  location: string;
  capacity_kwp: string | number;
  cover_image: string;
  description: string | null;
  before_image: string | null;
  after_image: string | null;
  gallery_images: string[];
  product_slugs: string[];
  customer_quote: string | null;
  customer_name: string | null;
  annual_savings_try: string | number | null;
  completion_date: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function mapProjectRow(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type,
    location: row.location,
    capacityKwp: Number(row.capacity_kwp),
    coverImage: row.cover_image,
    description: row.description,
    beforeImage: row.before_image,
    afterImage: row.after_image,
    galleryImages: row.gallery_images,
    productSlugs: row.product_slugs,
    customerQuote: row.customer_quote,
    customerName: row.customer_name,
    annualSavingsTry: row.annual_savings_try !== null ? Number(row.annual_savings_try) : null,
    completionDate: row.completion_date,
    isPublished: row.is_published,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type ProjectTypeFilter = 'all' | Project['type'];

export function filterProjectsByType(
  projects: Project[],
  filter: ProjectTypeFilter
): Project[] {
  if (filter === 'all') return projects;
  return projects.filter((p) => p.type === filter);
}
