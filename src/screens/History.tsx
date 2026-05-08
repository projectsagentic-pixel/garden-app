import React, { useState } from 'react';
import type { DiaryEntry, EntryKind, Bed } from '../types';
import { RoughBox, PlantGlyph, ScribbleTitle, Squiggle, SketchButton, Icon } from '../components/Sketchy';
import { PLANTS } from '../data/plants';

const KIND_COLORS: Record<EntryKind, string> = {
  siembra:  'var(--green-soft)',
  plantar:  'var(--green-soft)',
  riego:    'var(--sky-soft)',
  cosecha:  'var(--yellow-soft)',
  plaga:    'var(--terra-soft)',
  poda:     'var(--paper-2)',
  foto:     'var(--paper-2)',
  nota:     'var(--paper-2)',
};

const ENTRY_KINDS: EntryKind[] = ['siembra','plantar','riego','cosecha','plaga','poda','foto','nota'];

interface Props {
  entries: DiaryEntry[];
  beds: Bed[];
  onAdd: (entry: DiaryEntry) => void;
}

export function History({ entries, beds, onAdd }: Props) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <ScribbleTitle size={28}>Diario del huerto</ScribbleTitle>
          <div style={{ fontFamily: 'var(--note)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 8 }}>
            {entries.length} entradas · 2026
          </div>
        </div>
        <SketchButton fill="var(--green-soft)" width={120} onClick={() => setShowForm(true)}>
          + entrada
        </SketchButton>
      </div>

      {showForm && <EntryForm beds={beds} onSave={e => { onAdd(e); setShowForm(false); }} onCancel={() => setShowForm(false)} />}

      <Timeline entries={entries} beds={beds} />
    </div>
  );
}

function Timeline({ entries, beds }: { entries: DiaryEntry[]; beds: Bed[] }) {
  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-soft)', fontFamily: 'var(--note)', fontSize: 14 }}>
        No hay entradas todavía. ¡Añade la primera!
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', maxWidth: 560 }}>
      <div style={{ position: 'absolute', left: 46, top: 0, bottom: 0, width: 2, background: 'var(--ink-faint)', opacity: 0.3 }} />
      {entries.map((e, i) => {
        const bed = beds.find(b => b.id === e.bedId);
        const plant = e.plantId ? PLANTS.find(p => p.id === e.plantId) : null;
        const color = KIND_COLORS[e.kind] || 'var(--paper-2)';
        return (
          <div key={e.id} style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 30, fontFamily: 'var(--label)', fontSize: 11, color: 'var(--ink-faint)', textAlign: 'right', paddingTop: 10, flexShrink: 0 }}>{e.date}</div>
            <div style={{ position: 'relative', width: 24, display: 'flex', justifyContent: 'center', paddingTop: 10, flexShrink: 0 }}>
              <div style={{ width: 14, height: 14, background: color, border: '1.5px solid var(--line)', borderRadius: '50%', zIndex: 1 }} />
            </div>
            <div style={{ flex: 1 }}>
              <RoughBox width={440} height={72} fill={color} seed={i * 11 + 3} jitter={1.1}>
                <div style={{ padding: '8px 12px', display: 'flex', gap: 10 }}>
                  {plant ? <PlantGlyph kind={plant.kind} size={22} /> : <Icon kind="drop" size={22} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontFamily: 'var(--label)', fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase' }}>{e.kind}</span>
                      {bed && <span style={{ fontFamily: 'var(--label)', fontSize: 11, color: 'var(--ink-faint)' }}>· {bed.name}</span>}
                    </div>
                    <div style={{ fontFamily: 'var(--note)', fontSize: 13, marginTop: 3, lineHeight: 1.3 }}>{e.text}</div>
                  </div>
                  {e.kind === 'foto' && (
                    <div style={{ width: 44, height: 44, background: 'var(--paper)', border: '1.4px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon kind="camera" size={18} />
                    </div>
                  )}
                </div>
              </RoughBox>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EntryForm({ beds, onSave, onCancel }: { beds: Bed[]; onSave: (e: DiaryEntry) => void; onCancel: () => void }) {
  const [kind, setKind] = useState<EntryKind>('nota');
  const [bedId, setBedId] = useState(beds[0]?.id || '');
  const [text, setText] = useState('');
  const [plantId, setPlantId] = useState('');

  const handleSave = () => {
    if (!text.trim()) return;
    const entry: DiaryEntry = {
      id: `d${Date.now()}`,
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      bedId,
      kind,
      text,
      plantId: plantId || undefined,
      photos: [],
    };
    onSave(entry);
  };

  return (
    <div style={{ background: 'var(--paper-2)', border: '1.6px solid var(--line)', padding: '20px 24px', marginBottom: 24, maxWidth: 520 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--pen)', fontSize: 20, fontWeight: 600 }}>nueva entrada</div>
        <div style={{ fontFamily: 'var(--note)', fontSize: 12, color: 'var(--ink-soft)' }}>
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      <Label>tipo</Label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6, marginBottom: 14 }}>
        {ENTRY_KINDS.map(k => (
          <div key={k} onClick={() => setKind(k)}
            style={{ padding: '4px 10px', background: KIND_COLORS[k], border: `${kind === k ? 2 : 1.4}px solid ${kind === k ? 'var(--terra)' : 'var(--line)'}`, fontFamily: 'var(--label)', fontSize: 13, cursor: 'pointer' }}>
            {k}
          </div>
        ))}
      </div>

      <Label>bancal</Label>
      <select value={bedId} onChange={e => setBedId(e.target.value)}
        style={{ marginTop: 6, marginBottom: 14, width: '100%', padding: '6px 10px', fontFamily: 'var(--note)', fontSize: 14, background: 'var(--paper)', border: '1.4px solid var(--line)', borderRadius: 0, outline: 'none' }}>
        {beds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>

      <Label>planta (opcional)</Label>
      <select value={plantId} onChange={e => setPlantId(e.target.value)}
        style={{ marginTop: 6, marginBottom: 14, width: '100%', padding: '6px 10px', fontFamily: 'var(--note)', fontSize: 14, background: 'var(--paper)', border: '1.4px solid var(--line)', borderRadius: 0, outline: 'none' }}>
        <option value="">— ninguna —</option>
        {PLANTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      <Label>nota</Label>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={3}
        placeholder="qué ha pasado hoy..."
        style={{ marginTop: 6, marginBottom: 16, width: '100%', padding: '8px 12px', fontFamily: 'var(--note)', fontSize: 14, background: 'var(--paper)', border: '1.4px solid var(--line)', borderRadius: 0, outline: 'none', resize: 'vertical' }} />

      <div style={{ display: 'flex', gap: 8 }}>
        <SketchButton fill="var(--green-soft)" width={100} onClick={handleSave}>guardar</SketchButton>
        <SketchButton fill="var(--paper)" width={100} onClick={onCancel}>cancelar</SketchButton>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: 'var(--label)', fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{children}</div>;
}
