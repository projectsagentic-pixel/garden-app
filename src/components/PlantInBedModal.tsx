import { useState } from 'react';
import type { Bed } from '../types';
import { RoughBox, Icon, SketchButton } from './Sketchy';

interface Props {
  beds: Bed[];
  plantId: string;
  onConfirm: (bedId: string, x: number, y: number) => void;
  onCancel: () => void;
}

export function PlantInBedModal({ beds, onConfirm, onCancel }: Props) {
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);

  const selectedBed = beds.find(b => b.id === selectedBedId) ?? null;

  const isCellOccupied = (bed: Bed, x: number, y: number) =>
    bed.cells.some(c => c.x === x && c.y === y);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(31,29,26,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: 'var(--paper)', border: '1.6px solid var(--line)', padding: '28px 32px', maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ fontFamily: 'var(--pen)', fontSize: 22, fontWeight: 600, marginBottom: 20 }}>
          {selectedBed ? selectedBed.name : 'elige un bancal'}
        </div>

        {!selectedBed ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {beds.map(bed => (
              <div key={bed.id} onClick={() => setSelectedBedId(bed.id)}
                style={{ padding: '10px 14px', border: '1.4px solid var(--line)', background: 'var(--paper-2)', cursor: 'pointer', fontFamily: 'var(--note)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{bed.name}</span>
                <span style={{ fontFamily: 'var(--label)', fontSize: 11, color: 'var(--ink-soft)' }}>{bed.w}×{bed.h}</span>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div style={{ fontFamily: 'var(--label)', fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
              selecciona celda vacía
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${selectedBed.w}, 36px)`, gap: 4, marginBottom: 20 }}>
              {Array.from({ length: selectedBed.h }).map((_, y) =>
                Array.from({ length: selectedBed.w }).map((_, x) => {
                  const occupied = isCellOccupied(selectedBed, x, y);
                  return (
                    <RoughBox
                      key={`${x}-${y}`}
                      width={36}
                      height={36}
                      fill={occupied ? 'var(--paper-2)' : 'var(--green-soft)'}
                      seed={x * 13 + y * 7}
                      jitter={0.8}
                      onClick={occupied ? undefined : () => onConfirm(selectedBed.id, x, y)}
                      style={{ cursor: occupied ? 'default' : 'pointer', opacity: occupied ? 0.5 : 1 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        {!occupied && <Icon kind="plus" size={14} color="var(--ink-soft)" />}
                      </div>
                    </RoughBox>
                  );
                })
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <SketchButton fill="var(--paper)" width={110} onClick={() => setSelectedBedId(null)} seed={31}>
                ← bancales
              </SketchButton>
              <SketchButton fill="var(--paper)" width={90} onClick={onCancel} seed={37}>
                cancelar
              </SketchButton>
            </div>
          </div>
        )}

        {!selectedBed && (
          <div style={{ marginTop: 16 }}>
            <SketchButton fill="var(--paper)" width={90} onClick={onCancel} seed={41}>
              cancelar
            </SketchButton>
          </div>
        )}
      </div>
    </div>
  );
}
