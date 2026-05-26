import { useEffect, useState } from 'react';
import { listPlants, listGuides } from '../lib/publicCatalog';
import plantsSnapshot from '../data/plants_snapshot.json';
import type { PlantPublic, Guide } from '../types/public';

interface PublicCatalogState {
  plants: PlantPublic[];
  guides: Guide[];
  loading: boolean;
  error: string | null;
}

// Module-level cache survives component remounts within the SPA session.
let cached: { plants: PlantPublic[]; guides: Guide[] } | null = null;
let inflight: Promise<void> | null = null;

export function usePublicCatalog(): PublicCatalogState {
  const [state, setState] = useState<PublicCatalogState>(() => ({
    plants: cached?.plants ?? (plantsSnapshot as PlantPublic[]),
    guides: cached?.guides ?? [],
    loading: cached == null,
    error: null,
  }));

  useEffect(() => {
    if (cached) return;            // hot cache, no fetch needed

    if (inflight) {                // another mount is already fetching
      inflight.then(() => setState({
        plants: cached!.plants,
        guides: cached!.guides,
        loading: false,
        error: null,
      }));
      return;
    }

    inflight = (async () => {
      try {
        const [plants, guides] = await Promise.all([listPlants(), listGuides()]);
        cached = { plants, guides };
        setState({ plants, guides, loading: false, error: null });
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'fetch failed';
        // Keep snapshot data visible — degrade gracefully, don't blank
        setState(s => ({ ...s, loading: false, error: msg }));
      } finally {
        inflight = null;
      }
    })();
  }, []);

  return state;
}
