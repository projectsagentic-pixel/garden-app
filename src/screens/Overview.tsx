import type { Bed } from '../types';
import { RoughBox, PlantGlyph, ScribbleTitle, SketchButton, Icon } from '../components/Sketchy';
import { BED_COLORS } from '../components/BedColors';

interface Props {
  beds: Bed[];
  onSelectBed: (id: string) => void;
  onNewBed: () => void;
}

export function Overview({ beds, onSelectBed, onNewBed }: Props) {
  const totalPlants = beds.reduce((s, b) => s + b.cells.length, 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <ScribbleTitle size={30}>Mi huerto</ScribbleTitle>
          <div style={{ fontFamily: 'var(--note)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 8 }}>
            {beds.length} bancales · {totalPlants} plantas
          </div>
        </div>
        <SketchButton fill="var(--green-soft)" width={140} onClick={onNewBed}>
          + nuevo bancal
        </SketchButton>
      </div>

      {beds.length === 0 ? (
        <EmptyState onNew={onNewBed} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {beds.map((b, i) => <BedTile key={b.id} bed={b} idx={i} onClick={() => onSelectBed(b.id)} />)}
          <AddBedTile onClick={onNewBed} />
        </div>
      )}
    </div>
  );
}

function BedTile({ bed, idx, onClick }: { bed: Bed; idx: number; onClick: () => void }) {
  const fill = BED_COLORS[bed.colorIdx % BED_COLORS.length];
  const uniquePlants = [...new Set(bed.cells.map(c => c.plantId))];
  const pct = Math.round((bed.cells.length / (bed.w * bed.h)) * 100);

  return (
    <RoughBox width={220} height={170} fill="var(--paper)" seed={idx * 17 + 3} jitter={1.1} onClick={onClick}
      style={{ cursor: 'pointer' }}>
      <div style={{ padding: '12px 14px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: 'var(--pen)', fontSize: 19, fontWeight: 600, lineHeight: 1 }}>{bed.name}</div>
          <div style={{ fontFamily: 'var(--label)', fontSize: 11, color: 'var(--ink-faint)' }}>{bed.w}×{bed.h}</div>
        </div>

        {/* mini grid */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${bed.w}, 1fr)`,
            width: Math.min(bed.w * 16, 160),
            height: Math.min(bed.h * 16, 80),
            background: fill,
            padding: 2,
            border: '1.2px solid var(--line)',
            gap: 1,
          }}>
            {Array.from({ length: bed.w * bed.h }).map((_, i) => {
              const x = i % bed.w, y = Math.floor(i / bed.w);
              const cell = bed.cells.find(c => c.x === x && c.y === y);
              return (
                <div key={i} style={{ background: cell ? 'rgba(31,29,26,0.45)' : 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 3 }}>
            {uniquePlants.slice(0, 4).map(p => <PlantGlyph key={p} kind={p as import('../types').PlantKind} size={16} />)}
          </div>
          <span style={{ fontFamily: 'var(--label)', fontSize: 11, color: 'var(--ink-faint)' }}>{pct}% lleno</span>
        </div>
      </div>
    </RoughBox>
  );
}

function AddBedTile({ onClick }: { onClick: () => void }) {
  return (
    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={onClick}>
      <RoughBox width={220} height={170} fill="transparent" dashed seed={99}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--ink-faint)' }}>
          <Icon kind="plus" size={28} color="var(--ink-faint)" />
          <span style={{ fontFamily: 'var(--label)', fontSize: 14 }}>añadir bancal</span>
        </div>
      </RoughBox>
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 16, color: 'var(--ink-soft)' }}>
      <PlantGlyph kind="herb" size={64} />
      <div style={{ fontFamily: 'var(--note)', fontSize: 15, textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
        Todavía no tienes bancales. ¡Crea el primero para empezar a planificar tu huerto!
      </div>
      <SketchButton fill="var(--green-soft)" width={160} onClick={onNew}>+ primer bancal</SketchButton>
    </div>
  );
}
