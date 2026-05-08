import React, { useState } from 'react';
import type { Bed } from '../types';
import { BED_COLORS } from './BedColors';
import { SketchButton, RoughBox } from './Sketchy';

interface Props {
  onSave: (bed: Bed) => void;
  onCancel: () => void;
}

export function NewBedModal({ onSave, onCancel }: Props) {
  const [name, setName] = useState('');
  const [w, setW] = useState(4);
  const [h, setH] = useState(3);
  const [colorIdx, setColorIdx] = useState(0);

  const handleSave = () => {
    if (!name.trim()) return;
    const bed: Bed = { id: `b${Date.now()}`, name: name.trim(), w, h, colorIdx, cells: [] };
    onSave(bed);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(31,29,26,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: 'var(--paper)', border: '1.6px solid var(--line)', padding: '28px 32px', maxWidth: 420, width: '100%' }}>
        <div style={{ fontFamily: 'var(--pen)', fontSize: 24, fontWeight: 600, marginBottom: 20 }}>nuevo bancal</div>

        <Label>nombre</Label>
        <input value={name} onChange={e => setName(e.target.value)} autoFocus placeholder="ej: Bancal Sur"
          style={{ width: '100%', marginTop: 6, marginBottom: 16, padding: '8px 12px', fontFamily: 'var(--note)', fontSize: 15, background: 'var(--paper)', border: '1.4px solid var(--line)', borderRadius: 0, outline: 'none' }} />

        <Label>tamaño (columnas × filas)</Label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8, marginBottom: 16 }}>
          <NumInput value={w} onChange={setW} min={1} max={10} label="ancho" />
          <span style={{ fontFamily: 'var(--pen)', fontSize: 20 }}>×</span>
          <NumInput value={h} onChange={setH} min={1} max={8} label="alto" />
          <div style={{ fontFamily: 'var(--note)', fontSize: 13, color: 'var(--ink-soft)' }}>= {w * h} celdas</div>
        </div>

        {/* mini preview */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${w}, 20px)`, gap: 2, background: BED_COLORS[colorIdx], padding: 4, border: '1.2px solid var(--line)' }}>
            {Array.from({ length: w * h }).map((_, i) => <div key={i} style={{ width: 20, height: 20, background: 'rgba(255,255,255,0.4)' }} />)}
          </div>
        </div>

        <Label>color</Label>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, marginBottom: 20 }}>
          {BED_COLORS.map((c, i) => (
            <div key={i} onClick={() => setColorIdx(i)}
              style={{ width: 32, height: 32, background: c, border: `${colorIdx === i ? 2.5 : 1.4}px solid ${colorIdx === i ? 'var(--terra)' : 'var(--line)'}`, cursor: 'pointer', borderRadius: 2 }} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <SketchButton fill="var(--green-soft)" width={120} onClick={handleSave}>crear bancal</SketchButton>
          <SketchButton fill="var(--paper)" width={90} onClick={onCancel}>cancelar</SketchButton>
        </div>
      </div>
    </div>
  );
}

function NumInput({ value, onChange, min, max, label }: { value: number; onChange: (v: number) => void; min: number; max: number; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div onClick={() => onChange(Math.max(min, value - 1))} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.2px solid var(--line)', cursor: 'pointer', fontFamily: 'var(--pen)', fontSize: 18 }}>−</div>
      <div style={{ fontFamily: 'var(--pen)', fontSize: 20, fontWeight: 600, width: 24, textAlign: 'center' }}>{value}</div>
      <div onClick={() => onChange(Math.min(max, value + 1))} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.2px solid var(--line)', cursor: 'pointer', fontFamily: 'var(--pen)', fontSize: 18 }}>+</div>
      <span style={{ fontFamily: 'var(--label)', fontSize: 12, color: 'var(--ink-faint)' }}>{label}</span>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: 'var(--label)', fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{children}</div>;
}
