import { useState } from 'react';
import type { Plant } from '../types';
import { RoughBox, PlantGlyph, PlantTag, ScribbleTitle, SketchButton, Icon } from '../components/Sketchy';

type Filter = 'todas' | 'pleno' | 'medio' | 'fáciles' | 'difíciles';

interface Props {
  plants: Plant[];
  onSelectPlant: (id: string) => void;
  onAddPlant: () => void;
}

export function Catalog({ plants, onSelectPlant, onAddPlant }: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('todas');

  const filtered = plants.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'pleno' && p.sun !== 'pleno') return false;
    if (filter === 'medio' && p.sun !== 'medio') return false;
    if (filter === 'fáciles' && p.difficulty > 1) return false;
    if (filter === 'difíciles' && p.difficulty < 2) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <ScribbleTitle size={28}>Plantas</ScribbleTitle>
          <div style={{ fontFamily: 'var(--note)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 8 }}>
            {plants.length} especies en catálogo
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1.4px solid var(--line)', padding: '5px 12px', background: 'var(--paper)' }}>
            <Icon kind="search" size={16} color="var(--ink-faint)" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="buscar..."
              style={{ border: 'none', outline: 'none', fontFamily: 'var(--note)', fontSize: 14, background: 'transparent', width: 140 }} />
          </div>
          <SketchButton fill="var(--green-soft)" width={150} onClick={onAddPlant} seed={13}>
            + añadir planta
          </SketchButton>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['todas', 'pleno', 'medio', 'fáciles', 'difíciles'] as Filter[]).map(f => (
          <div key={f} onClick={() => setFilter(f)}
            style={{ padding: '4px 12px', background: filter === f ? 'var(--terra-soft)' : 'var(--paper)', border: '1.4px solid var(--line)', borderRadius: 14, fontFamily: 'var(--label)', fontSize: 12, cursor: 'pointer' }}>
            {f}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        {filtered.map((p, i) => (
          <PlantCard key={p.id} plant={p} idx={i} onClick={() => onSelectPlant(p.id)} />
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: '40px 0', textAlign: 'center', fontFamily: 'var(--note)', fontSize: 14, color: 'var(--ink-faint)' }}>
            sin resultados
          </div>
        )}
      </div>
    </div>
  );
}

function PlantCard({ plant: p, idx, onClick }: { plant: Plant; idx: number; onClick: () => void }) {
  return (
    <RoughBox width="100%" height={170} fill="var(--paper)" seed={idx * 7 + 3} jitter={1.1} onClick={onClick}
      style={{ cursor: 'pointer', minWidth: 0 }}>
      <div style={{ padding: '10px 12px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {p.custom && (
          <div style={{ fontFamily: 'var(--label)', fontSize: 9, color: 'var(--terra)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
            personalizada
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 56 }}>
          <PlantGlyph kind={p.kind} size={44} />
        </div>
        <div style={{ fontFamily: 'var(--pen)', fontSize: 14, fontWeight: 600, lineHeight: 1.2, marginTop: 6 }}>{p.name}</div>
        <div style={{ fontFamily: 'var(--note)', fontSize: 10, color: 'var(--ink-soft)', marginTop: 2 }}>{p.family}</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--label)', fontSize: 10, color: 'var(--ink-soft)' }}>
          <Icon kind="sun" size={12} color="var(--ink-soft)" />
          <span>{p.sun}</span>
          <span>·</span>
          <Icon kind="drop" size={10} color="var(--ink-soft)" />
          <span>{'•'.repeat(p.water)}</span>
        </div>
      </div>
    </RoughBox>
  );
}

// ── Plant Detail ──────────────────────────────────────────────────────────────
interface DetailProps {
  plants: Plant[];
  plantId: string;
  onBack: () => void;
}

export function PlantDetail({ plants, plantId, onBack }: DetailProps) {
  const p = plants.find(pl => pl.id === plantId);
  if (!p) return null;

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div onClick={onBack} style={{ cursor: 'pointer' }}><Icon kind="arrow-l" size={22} color="var(--ink-soft)" /></div>
        <ScribbleTitle size={26}>{p.name}</ScribbleTitle>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <RoughBox width={120} height={120} fill="var(--terra-soft)" seed={3} jitter={1.4}>
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlantGlyph kind={p.kind} size={72} />
          </div>
        </RoughBox>

        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontFamily: 'var(--note)', fontSize: 12, color: 'var(--ink-soft)', fontStyle: 'italic', marginBottom: 12 }}>{p.family}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
            <StatBox icon="sun" label="sol" value={p.sun} />
            <StatBox icon="drop" label="riego" value={'•'.repeat(p.water)} />
            <StatBox icon="leaf" label="nivel" value={['fácil', 'media', 'difícil'][p.difficulty - 1]} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={{ fontFamily: 'var(--pen)', fontSize: 18, fontWeight: 600, marginBottom: 10 }}>cuándo plantar</div>
        <PlantTimeline plant={p} />
      </div>

      {p.companions.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontFamily: 'var(--pen)', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>se lleva bien con</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {p.companions.map(c => {
              const cp = plants.find(pl => pl.id === c);
              return cp ? <PlantTag key={c} icon={cp.kind} name={cp.name} color="var(--green-soft)" /> : null;
            })}
          </div>
        </div>
      )}

      {p.avoid.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: 'var(--pen)', fontSize: 14, fontWeight: 600, color: 'var(--terra)', marginBottom: 6 }}>evita junto a</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {p.avoid.map(c => {
              const cp = plants.find(pl => pl.id === c);
              return cp ? <PlantTag key={c} icon={cp.kind} name={cp.name} color="var(--terra-soft)" /> : null;
            })}
          </div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <SketchButton fill="var(--green-soft)" width={220} height={42}>
          + plantar en un bancal
        </SketchButton>
      </div>
    </div>
  );
}

function PlantTimeline({ plant: p }: { plant: Plant }) {
  const months = ['e', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'];
  return (
    <div style={{ border: '1.4px solid var(--line)', background: 'var(--paper-2)', padding: '10px 14px' }}>
      <div style={{ display: 'flex', fontFamily: 'var(--label)', fontSize: 10, color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
        {months.map((m, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>{m}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 1, marginTop: 5 }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const sowM = p.sow.includes(i);
          const plantM = p.plant.includes(i);
          const harvestM = p.harvest.includes(i);
          return (
            <div key={i} style={{
              flex: 1, height: 20,
              background: harvestM ? 'var(--yellow-soft)' : (sowM || plantM) ? 'var(--green-soft)' : 'rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.08)',
            }} />
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 6, fontFamily: 'var(--label)', fontSize: 10, color: 'var(--ink-soft)' }}>
        <span style={{ color: 'var(--green)' }}>■ sembrar/plantar</span>
        <span style={{ color: 'var(--yellow)' }}>■ cosechar</span>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ border: '1.4px solid var(--line)', background: 'var(--paper-2)', padding: '9px 12px', minWidth: 80 }}>
      <Icon kind={icon} size={16} />
      <div style={{ fontFamily: 'var(--label)', fontSize: 9, color: 'var(--ink-faint)', textTransform: 'uppercase', marginTop: 3, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontFamily: 'var(--note)', fontSize: 13, fontWeight: 600, marginTop: 2, lineHeight: 1.2 }}>{value}</div>
    </div>
  );
}
