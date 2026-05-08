import React, { useState } from 'react';
import type { Plant, PlantKind } from '../types';
import { RoughBox, PlantGlyph, PlantTag, ScribbleTitle, Squiggle, SketchButton, Icon } from '../components/Sketchy';
import { PLANTS } from '../data/plants';

type Filter = 'todas' | 'pleno' | 'medio' | 'fáciles' | 'difíciles';

interface Props {
  onSelectPlant: (id: string) => void;
}

export function Catalog({ onSelectPlant }: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('todas');

  const filtered = PLANTS.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'pleno' && p.sun !== 'pleno') return false;
    if (filter === 'medio' && p.sun !== 'medio') return false;
    if (filter === 'fáciles' && p.difficulty > 1) return false;
    if (filter === 'difíciles' && p.difficulty < 2) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <ScribbleTitle size={28}>Plantas</ScribbleTitle>
          <div style={{ fontFamily: 'var(--note)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 8 }}>
            {PLANTS.length} especies en catálogo
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1.4px solid var(--line)', padding: '5px 12px', background: 'var(--paper)' }}>
            <Icon kind="search" size={16} color="var(--ink-faint)" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="buscar..."
              style={{ border: 'none', outline: 'none', fontFamily: 'var(--note)', fontSize: 14, background: 'transparent', width: 160 }} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['todas','pleno','medio','fáciles','difíciles'] as Filter[]).map(f => (
          <div key={f} onClick={() => setFilter(f)}
            style={{ padding: '4px 12px', background: filter === f ? 'var(--terra-soft)' : 'var(--paper)', border: '1.4px solid var(--line)', borderRadius: 14, fontFamily: 'var(--label)', fontSize: 12, cursor: 'pointer' }}>
            {f}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
        {filtered.map((p, i) => <PlantCard key={p.id} plant={p} idx={i} onClick={() => onSelectPlant(p.id)} />)}
      </div>
    </div>
  );
}

function PlantCard({ plant: p, idx, onClick }: { plant: Plant; idx: number; onClick: () => void }) {
  return (
    <RoughBox width={160} height={180} fill="var(--paper)" seed={idx * 7 + 3} jitter={1.1} onClick={onClick}
      style={{ cursor: 'pointer' }}>
      <div style={{ padding: '12px 14px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 64 }}>
          <PlantGlyph kind={p.kind} size={52} />
        </div>
        <div style={{ fontFamily: 'var(--pen)', fontSize: 16, fontWeight: 600, lineHeight: 1.1, marginTop: 6 }}>{p.name}</div>
        <div style={{ fontFamily: 'var(--note)', fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>{p.family}</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--label)', fontSize: 11, color: 'var(--ink-soft)' }}>
          <Icon kind="sun" size={14} color="var(--ink-soft)" />
          <span>{p.sun}</span>
          <span>·</span>
          <Icon kind="drop" size={12} color="var(--ink-soft)" />
          <span>{'•'.repeat(p.water)}</span>
        </div>
      </div>
    </RoughBox>
  );
}

// ── Plant Detail ──────────────────────────────────────────────────────────────
interface DetailProps {
  plantId: string;
  onBack: () => void;
}

export function PlantDetail({ plantId, onBack }: DetailProps) {
  const p = PLANTS.find(pl => pl.id === plantId);
  if (!p) return null;

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div onClick={onBack} style={{ cursor: 'pointer' }}><Icon kind="arrow-l" size={22} color="var(--ink-soft)" /></div>
        <ScribbleTitle size={26}>{p.name}</ScribbleTitle>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* illustration */}
        <RoughBox width={130} height={130} fill="var(--terra-soft)" seed={3} jitter={1.4}>
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlantGlyph kind={p.kind} size={80} />
          </div>
        </RoughBox>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: 'var(--note)', fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic', marginBottom: 14 }}>{p.family}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <StatBox icon="sun" label="sol" value={p.sun} />
            <StatBox icon="drop" label="riego" value={'•'.repeat(p.water)} />
            <StatBox icon="leaf" label="dificultad" value={['fácil','media','difícil'][p.difficulty - 1]} />
          </div>
        </div>
      </div>

      {/* planting timeline */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontFamily: 'var(--pen)', fontSize: 18, fontWeight: 600, marginBottom: 10 }}>cuándo plantar</div>
        <PlantTimeline plant={p} />
      </div>

      {/* companions */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontFamily: 'var(--pen)', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>se lleva bien con</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {p.companions.map(c => {
            const cp = PLANTS.find(pl => pl.id === c);
            return cp ? <PlantTag key={c} icon={cp.kind} name={cp.name} color="var(--green-soft)" /> : null;
          })}
        </div>
        {p.avoid.length > 0 && (
          <>
            <div style={{ fontFamily: 'var(--pen)', fontSize: 14, fontWeight: 600, color: 'var(--terra)', marginTop: 10, marginBottom: 6 }}>evita junto a</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {p.avoid.map(c => {
                const cp = PLANTS.find(pl => pl.id === c);
                return cp ? <PlantTag key={c} icon={cp.kind} name={cp.name} color="var(--terra-soft)" /> : null;
              })}
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <SketchButton fill="var(--green-soft)" width={220} height={42}>
          + plantar en un bancal
        </SketchButton>
      </div>
    </div>
  );
}

function PlantTimeline({ plant: p }: { plant: Plant }) {
  const months = ['e','f','m','a','m','j','j','a','s','o','n','d'];
  return (
    <RoughBox width={440} height={60} fill="var(--paper-2)" seed={9} jitter={1.1}>
      <div style={{ padding: '8px 12px' }}>
        <div style={{ display: 'flex', fontFamily: 'var(--label)', fontSize: 10, color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
          {months.map((m, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontWeight: i === 3 ? 700 : 400, color: i === 3 ? 'var(--terra)' : undefined }}>{m}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 1, marginTop: 4 }}>
          {Array.from({ length: 12 }).map((_, i) => {
            const sow = p.sow.includes(i);
            const plant = p.plant.includes(i);
            const harvest = p.harvest.includes(i);
            return (
              <div key={i} style={{ flex: 1, height: 18, background: harvest ? 'var(--yellow-soft)' : sow || plant ? 'var(--green-soft)' : 'transparent', border: '1px solid rgba(0,0,0,0.12)' }} />
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 4, fontFamily: 'var(--label)', fontSize: 10, color: 'var(--ink-soft)' }}>
          <span>■ sembrar</span>
          <span>■ cosechar</span>
        </div>
      </div>
    </RoughBox>
  );
}

function StatBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <RoughBox width={100} height={64} fill="var(--paper-2)" seed={icon.length * 5} jitter={1}>
      <div style={{ padding: '8px 10px' }}>
        <Icon kind={icon} size={18} />
        <div style={{ fontFamily: 'var(--label)', fontSize: 10, color: 'var(--ink-faint)', textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
        <div style={{ fontFamily: 'var(--note)', fontSize: 13, fontWeight: 600, lineHeight: 1 }}>{value}</div>
      </div>
    </RoughBox>
  );
}
