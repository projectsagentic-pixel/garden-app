import { useState } from 'react';
import type { Plant, PlantKind } from '../types';
import { SketchButton } from './Sketchy';

interface Props {
  onSave: (plant: Plant) => void;
  onCancel: () => void;
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const KIND_OPTIONS: { value: PlantKind; label: string }[] = [
  { value: 'tomato', label: 'Tomate' },
  { value: 'pepper', label: 'Pimiento' },
  { value: 'lettuce', label: 'Ensalada' },
  { value: 'carrot', label: 'Zanahoria' },
  { value: 'onion', label: 'Cebolla' },
  { value: 'bean', label: 'Legumbre' },
  { value: 'herb', label: 'Aromática' },
  { value: 'flower', label: 'Flor' },
  { value: 'root', label: 'Raíz' },
  { value: 'brassica', label: 'Crucífera' },
  { value: 'cucurbit', label: 'Cucurbitácea' },
  { value: 'leaf', label: 'Hoja' },
];

function MonthPicker({ label, selected, onChange }: {
  label: string;
  selected: number[];
  onChange: (months: number[]) => void;
}) {
  const toggle = (i: number) => {
    onChange(selected.includes(i) ? selected.filter(m => m !== i) : [...selected, i]);
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <Label>{label}</Label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
        {MONTHS.map((m, i) => (
          <div key={i} onClick={() => toggle(i)}
            style={{
              padding: '3px 7px', fontFamily: 'var(--label)', fontSize: 11,
              border: '1.2px solid var(--line)', cursor: 'pointer', borderRadius: 2,
              background: selected.includes(i) ? 'var(--green-soft)' : 'var(--paper)',
              fontWeight: selected.includes(i) ? 700 : 400,
            }}>
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: 'var(--label)', fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {children}
    </div>
  );
}

export function AddPlantModal({ onSave, onCancel }: Props) {
  const [name, setName] = useState('');
  const [family, setFamily] = useState('');
  const [kind, setKind] = useState<PlantKind>('leaf');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1);
  const [sun, setSun] = useState<'pleno' | 'medio' | 'sombra'>('pleno');
  const [water, setWater] = useState<1 | 2 | 3>(2);
  const [sow, setSow] = useState<number[]>([]);
  const [plant, setPlant] = useState<number[]>([]);
  const [harvest, setHarvest] = useState<number[]>([]);

  const handleSave = () => {
    if (!name.trim()) return;
    const newPlant: Plant = {
      id: `custom-${Date.now()}`,
      kind,
      name: name.trim(),
      family: family.trim() || 'Personalizada',
      difficulty,
      sun,
      water,
      companions: [],
      avoid: [],
      sow,
      plant,
      harvest,
      custom: true,
    };
    onSave(newPlant);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', marginTop: 6, marginBottom: 14, padding: '7px 10px',
    fontFamily: 'var(--note)', fontSize: 14, background: 'var(--paper)',
    border: '1.4px solid var(--line)', borderRadius: 0, outline: 'none',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(31,29,26,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '16px' }}>
      <div style={{ background: 'var(--paper)', border: '1.6px solid var(--line)', padding: '24px 28px', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ fontFamily: 'var(--pen)', fontSize: 22, fontWeight: 600, marginBottom: 20 }}>añadir planta</div>

        <Label>nombre *</Label>
        <input value={name} onChange={e => setName(e.target.value)} autoFocus
          placeholder="ej: Tomate corazón de buey"
          style={inputStyle} />

        <Label>familia botánica</Label>
        <input value={family} onChange={e => setFamily(e.target.value)}
          placeholder="ej: Solanáceas"
          style={inputStyle} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <Label>tipo</Label>
            <select value={kind} onChange={e => setKind(e.target.value as PlantKind)}
              style={{ ...inputStyle, marginBottom: 0, cursor: 'pointer' }}>
              {KIND_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>sol</Label>
            <select value={sun} onChange={e => setSun(e.target.value as 'pleno' | 'medio' | 'sombra')}
              style={{ ...inputStyle, marginBottom: 0, cursor: 'pointer' }}>
              <option value="pleno">Pleno sol</option>
              <option value="medio">Semisombra</option>
              <option value="sombra">Sombra</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <Label>dificultad</Label>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {([1, 2, 3] as const).map(d => (
                <div key={d} onClick={() => setDifficulty(d)}
                  style={{
                    padding: '5px 12px', fontFamily: 'var(--label)', fontSize: 12,
                    border: '1.2px solid var(--line)', cursor: 'pointer', borderRadius: 2,
                    background: difficulty === d ? 'var(--terra-soft)' : 'var(--paper)',
                  }}>
                  {['fácil', 'media', 'difícil'][d - 1]}
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label>riego</Label>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {([1, 2, 3] as const).map(w => (
                <div key={w} onClick={() => setWater(w)}
                  style={{
                    padding: '5px 12px', fontFamily: 'var(--label)', fontSize: 12,
                    border: '1.2px solid var(--line)', cursor: 'pointer', borderRadius: 2,
                    background: water === w ? 'var(--sky-soft)' : 'var(--paper)',
                  }}>
                  {'•'.repeat(w)}
                </div>
              ))}
            </div>
          </div>
        </div>

        <MonthPicker label="meses de siembra" selected={sow} onChange={setSow} />
        <MonthPicker label="meses de trasplante" selected={plant} onChange={setPlant} />
        <MonthPicker label="meses de cosecha" selected={harvest} onChange={setHarvest} />

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <SketchButton fill="var(--green-soft)" width={140} onClick={handleSave}>guardar planta</SketchButton>
          <SketchButton fill="var(--paper)" width={90} onClick={onCancel}>cancelar</SketchButton>
        </div>
      </div>
    </div>
  );
}
