import { useState, useEffect, useCallback } from 'react';
import type { Bed, DiaryEntry } from '../types';

const BEDS_KEY = 'sg_beds';
const DIARY_KEY = 'sg_diary';

const DEFAULT_BEDS: Bed[] = [
  {
    id: 'b1',
    name: 'Bancal Norte',
    w: 4,
    h: 3,
    colorIdx: 0,
    cells: [
      { x: 0, y: 0, plantId: 'tomato', plantedDate: '12 abr' },
      { x: 1, y: 0, plantId: 'tomato', plantedDate: '12 abr' },
      { x: 2, y: 0, plantId: 'pepper', plantedDate: '12 abr' },
      { x: 3, y: 0, plantId: 'pepper', plantedDate: '12 abr' },
      { x: 0, y: 1, plantId: 'lettuce', plantedDate: '5 abr' },
      { x: 1, y: 1, plantId: 'lettuce', plantedDate: '5 abr' },
      { x: 2, y: 1, plantId: 'herb', plantedDate: '5 abr' },
      { x: 0, y: 2, plantId: 'carrot', plantedDate: '20 mar' },
      { x: 1, y: 2, plantId: 'carrot', plantedDate: '20 mar' },
      { x: 2, y: 2, plantId: 'onion', plantedDate: '15 mar' },
      { x: 3, y: 2, plantId: 'flower', plantedDate: '5 abr' },
    ],
  },
  { id: 'b2', name: 'El Cuadrado', w: 3, h: 3, colorIdx: 1, cells: [
    { x: 0, y: 0, plantId: 'lettuce', plantedDate: '1 abr' },
    { x: 1, y: 0, plantId: 'lettuce', plantedDate: '1 abr' },
    { x: 0, y: 1, plantId: 'carrot', plantedDate: '15 mar' },
    { x: 1, y: 1, plantId: 'carrot', plantedDate: '15 mar' },
    { x: 2, y: 1, plantId: 'carrot', plantedDate: '15 mar' },
  ]},
  { id: 'b3', name: 'Hierbas', w: 5, h: 2, colorIdx: 2, cells: [
    { x: 0, y: 0, plantId: 'herb', plantedDate: '10 abr' },
    { x: 1, y: 0, plantId: 'herb', plantedDate: '10 abr' },
    { x: 2, y: 0, plantId: 'flower', plantedDate: '10 abr' },
    { x: 3, y: 0, plantId: 'flower', plantedDate: '10 abr' },
  ]},
  { id: 'b4', name: 'Bancal Largo', w: 6, h: 2, colorIdx: 3, cells: [
    { x: 0, y: 0, plantId: 'onion', plantedDate: '1 mar' },
    { x: 1, y: 0, plantId: 'onion', plantedDate: '1 mar' },
    { x: 2, y: 0, plantId: 'bean', plantedDate: '15 abr' },
    { x: 3, y: 0, plantId: 'bean', plantedDate: '15 abr' },
    { x: 0, y: 1, plantId: 'lettuce', plantedDate: '5 abr' },
  ]},
  { id: 'b5', name: 'Junto al Muro', w: 3, h: 2, colorIdx: 4, cells: [
    { x: 0, y: 0, plantId: 'tomato', plantedDate: '20 abr' },
    { x: 1, y: 0, plantId: 'pepper', plantedDate: '20 abr' },
  ]},
];

const DEFAULT_DIARY: DiaryEntry[] = [
  { id: 'd1', date: '30 abr', bedId: 'b1', kind: 'cosecha', text: 'Primeras lechugas! 4 cabezas, ~1.2 kg', plantId: 'lettuce', photos: [] },
  { id: 'd2', date: '28 abr', bedId: 'b1', kind: 'riego',   text: 'Regado profundo, suelo seco arriba', photos: [] },
  { id: 'd3', date: '25 abr', bedId: 'b2', kind: 'plaga',   text: 'Pulgón en pimiento — neem aplicado', plantId: 'pepper', photos: [] },
  { id: 'd4', date: '22 abr', bedId: 'b3', kind: 'siembra', text: 'Sembrada albahaca y perejil', plantId: 'herb', photos: [] },
  { id: 'd5', date: '20 abr', bedId: 'b1', kind: 'foto',    text: 'Tomates con primeras flores 🌼', plantId: 'tomato', photos: [] },
  { id: 'd6', date: '15 abr', bedId: 'b4', kind: 'siembra', text: 'Judías directo a tierra, 2 filas', plantId: 'bean', photos: [] },
  { id: 'd7', date: '12 abr', bedId: 'b1', kind: 'plantar', text: 'Plantón de tomate cherry × 2', plantId: 'tomato', photos: [] },
];

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useStore() {
  const [beds, setBeds] = useState<Bed[]>(() => load(BEDS_KEY, DEFAULT_BEDS));
  const [diary, setDiary] = useState<DiaryEntry[]>(() => load(DIARY_KEY, DEFAULT_DIARY));

  useEffect(() => { save(BEDS_KEY, beds); }, [beds]);
  useEffect(() => { save(DIARY_KEY, diary); }, [diary]);

  const addBed = useCallback((bed: Bed) => {
    setBeds(prev => [...prev, bed]);
  }, []);

  const updateBed = useCallback((bed: Bed) => {
    setBeds(prev => prev.map(b => b.id === bed.id ? bed : b));
  }, []);

  const deleteBed = useCallback((id: string) => {
    setBeds(prev => prev.filter(b => b.id !== id));
  }, []);

  const addEntry = useCallback((entry: DiaryEntry) => {
    setDiary(prev => [entry, ...prev]);
  }, []);

  return { beds, diary, addBed, updateBed, deleteBed, addEntry };
}
