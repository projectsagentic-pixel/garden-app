export type PlantKind = 'tomato' | 'pepper' | 'lettuce' | 'carrot' | 'onion' | 'bean' | 'herb' | 'flower' | 'leaf';

export interface Plant {
  id: string;
  kind: PlantKind;
  name: string;
  family: string;
  difficulty: 1 | 2 | 3;
  sun: 'pleno' | 'medio' | 'sombra';
  water: 1 | 2 | 3;
  companions: PlantKind[];
  avoid: PlantKind[];
  sow: number[];     // 0-indexed months
  plant: number[];
  harvest: number[];
}

export interface BedCell {
  x: number;
  y: number;
  plantId: string;
  plantedDate: string;
  notes?: string;
}

export interface Bed {
  id: string;
  name: string;
  w: number;
  h: number;
  cells: BedCell[];
  colorIdx: number;
}

export type EntryKind = 'siembra' | 'plantar' | 'riego' | 'cosecha' | 'plaga' | 'poda' | 'foto' | 'nota';

export interface DiaryEntry {
  id: string;
  date: string;
  bedId: string;
  kind: EntryKind;
  text: string;
  plantId?: string;
  quantity?: string;
  photos: string[];
}

export type Screen = 'overview' | 'bed' | 'calendar' | 'history' | 'catalog' | 'plant-detail';
