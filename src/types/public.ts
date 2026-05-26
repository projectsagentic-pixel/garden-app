import type { PlantKind } from '../types';

export type PublishStatus = 'draft' | 'published' | 'archived';

export interface PlantPublic {
  id: string;
  slug: string;
  scientificName: string;
  commonNames: string[];
  family: string | null;
  kind: PlantKind;
  difficulty: 1 | 2 | 3 | null;
  sun: 'pleno' | 'medio' | 'sombra' | null;
  water: 1 | 2 | 3 | null;
  companions: string[];
  avoid: string[];
  sowMonths: number[];
  plantMonths: number[];
  harvestMonths: number[];
  descriptionMd: string | null;
  images: string[];
  galiciaRelevant: boolean;
  status: PublishStatus;
  sourceName: string | null;
  sourceUrl: string | null;
  updatedAt: string;     // ISO timestamp
}

export type GuideCategory =
  | 'poda' | 'diseño' | 'bancales' | 'plagas'
  | 'riego' | 'compost' | 'setos';

export interface Guide {
  id: string;
  slug: string;
  title: string;
  category: GuideCategory;
  summary: string | null;
  contentMd: string;
  heroImage: string | null;
  relatedPlantSlugs: string[];
  readingTimeMin: number | null;
  status: PublishStatus;
  sourceName: string | null;
  sourceUrl: string | null;
  updatedAt: string;
}
