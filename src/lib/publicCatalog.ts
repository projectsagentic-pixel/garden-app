import { supabase } from './supabase';
import type { PlantPublic, Guide } from '../types/public';
import type { Plant } from '../types';

// ---------------------------------------------------------------------------
// Internal row → domain mappers
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rowToPlantPublic(row: Record<string, any>): PlantPublic {
  return {
    id: row.id as string,
    slug: row.slug as string,
    scientificName: row.scientific_name as string,
    commonNames: (row.common_names as string[]) ?? [],
    family: (row.family as string | null) ?? null,
    kind: row.kind,
    difficulty: row.difficulty ?? null,
    sun: row.sun ?? null,
    water: row.water ?? null,
    companions: (row.companions as string[]) ?? [],
    avoid: (row.avoid as string[]) ?? [],
    sowMonths: (row.sow_months as number[]) ?? [],
    plantMonths: (row.plant_months as number[]) ?? [],
    harvestMonths: (row.harvest_months as number[]) ?? [],
    descriptionMd: (row.description_md as string | null) ?? null,
    images: (row.images as string[]) ?? [],
    galiciaRelevant: Boolean(row.galicia_relevant),
    status: row.status,
    sourceName: (row.source_name as string | null) ?? null,
    sourceUrl: (row.source_url as string | null) ?? null,
    updatedAt: row.updated_at as string,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rowToGuide(row: Record<string, any>): Guide {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    category: row.category,
    summary: (row.summary as string | null) ?? null,
    contentMd: row.content_md as string,
    heroImage: (row.hero_image as string | null) ?? null,
    relatedPlantSlugs: (row.related_plant_slugs as string[]) ?? [],
    readingTimeMin: (row.reading_time_min as number | null) ?? null,
    status: row.status,
    sourceName: (row.source_name as string | null) ?? null,
    sourceUrl: (row.source_url as string | null) ?? null,
    updatedAt: row.updated_at as string,
  };
}

// ---------------------------------------------------------------------------
// Exported mapper: PlantPublic → Plant
// CRITICAL: id is set to slug so BedCell.plantId references remain stable.
// ---------------------------------------------------------------------------

export function plantPublicToPlant(p: PlantPublic): Plant {
  return {
    id: p.slug,                                 // slug becomes the in-app id
    kind: p.kind,
    name: p.commonNames[0] ?? p.scientificName,
    family: p.family ?? '',
    difficulty: (p.difficulty ?? 2) as 1 | 2 | 3,
    sun: p.sun ?? 'pleno',
    water: (p.water ?? 2) as 1 | 2 | 3,
    companions: p.companions,
    avoid: p.avoid,
    sow: p.sowMonths,
    plant: p.plantMonths,
    harvest: p.harvestMonths,
  };
}

// ---------------------------------------------------------------------------
// Query functions
// ---------------------------------------------------------------------------

interface ListPlantsOpts {
  limit?: number;
  offset?: number;
}

interface ListGuidesOpts {
  category?: string;
  limit?: number;
}

export async function listPlants(opts: ListPlantsOpts = {}): Promise<PlantPublic[]> {
  const { limit = 500, offset = 0 } = opts;
  const { data, error } = await supabase
    .from('plants_public')
    .select('*')
    .eq('status', 'published')
    .order('slug')
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[publicCatalog] listPlants error:', error);
    throw error;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: Record<string, any>) => rowToPlantPublic(row));
}

export async function getPlantBySlug(slug: string): Promise<PlantPublic | null> {
  const { data, error } = await supabase
    .from('plants_public')
    .select('*')
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('[publicCatalog] getPlantBySlug error:', error);
    throw error;
  }

  return data ? rowToPlantPublic(data) : null;
}

export async function listGuides(opts: ListGuidesOpts = {}): Promise<Guide[]> {
  const { category, limit = 500 } = opts;
  let query = supabase
    .from('guides')
    .select('*')
    .eq('status', 'published')
    .order('slug')
    .limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[publicCatalog] listGuides error:', error);
    throw error;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: Record<string, any>) => rowToGuide(row));
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('[publicCatalog] getGuideBySlug error:', error);
    throw error;
  }

  return data ? rowToGuide(data) : null;
}
