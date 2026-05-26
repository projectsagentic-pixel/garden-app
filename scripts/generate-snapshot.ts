// Run via: tsx scripts/generate-snapshot.ts
// Wired as "prebuild" in package.json so it runs before every production build.
// If VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are absent, writes [] and exits 0
// (build never fails in CI environments without Supabase credentials).

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

const here = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(here, '..', 'src', 'data', 'plants_snapshot.json');

// ---------------------------------------------------------------------------
// Row → camelCase mapper (mirrors rowToPlantPublic in publicCatalog.ts)
// Kept inline here so the script has no dependency on the src/ tree at build time.
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCamel(row: Record<string, any>): Record<string, unknown> {
  return {
    id: row.id,
    slug: row.slug,
    scientificName: row.scientific_name,
    commonNames: row.common_names ?? [],
    family: row.family ?? null,
    kind: row.kind,
    difficulty: row.difficulty ?? null,
    sun: row.sun ?? null,
    water: row.water ?? null,
    companions: row.companions ?? [],
    avoid: row.avoid ?? [],
    sowMonths: row.sow_months ?? [],
    plantMonths: row.plant_months ?? [],
    harvestMonths: row.harvest_months ?? [],
    descriptionMd: row.description_md ?? null,
    images: row.images ?? [],
    galiciaRelevant: Boolean(row.galicia_relevant),
    status: row.status,
    sourceName: row.source_name ?? null,
    sourceUrl: row.source_url ?? null,
    updatedAt: row.updated_at,
  };
}

async function main(): Promise<void> {
  let plants: unknown[] = [];

  if (!url || !key) {
    console.warn('[snapshot] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing; writing empty snapshot');
  } else {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from('plants_public')
      .select('*')
      .eq('status', 'published')
      .order('slug');

    if (error) {
      console.warn('[snapshot] fetch failed, writing empty snapshot:', error.message);
    } else {
      plants = (data ?? []).map(rowToCamel);
    }
  }

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(plants, null, 0));
  console.log(`[snapshot] wrote ${plants.length} plants to ${outPath}`);
}

main().catch(e => {
  console.error('[snapshot] unexpected error:', e);
  process.exit(1);
});
