import { useState } from 'react';
import type { Bed, BedCell, PlantKind } from '../types';
import { RoughBox, PlantGlyph, ScribbleTitle, Squiggle, SketchButton, Icon, Dots } from '../components/Sketchy';
import { BED_COLORS, cellColor } from '../components/BedColors';
import { PLANTS, getPlant } from '../data/plants';

interface Props {
  bed: Bed;
  onSave: (bed: Bed) => void;
  onBack: () => void;
}

const CELL_SIZE = 64;

export function BedEditor({ bed: initialBed, onSave, onBack }: Props) {
  const [bed, setBed] = useState<Bed>(initialBed);
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialBed.name);

  const findCell = (x: number, y: number) => bed.cells.find(c => c.x === x && c.y === y);

  const handleCellClick = (x: number, y: number) => {
    if (!editing) {
      setSelectedCell({ x, y });
      return;
    }
    if (!selectedPlant) return;

    const existing = findCell(x, y);
    if (existing) {
      // remove plant
      setBed(prev => ({ ...prev, cells: prev.cells.filter(c => !(c.x === x && c.y === y)) }));
    } else {
      // place plant
      const newCell: BedCell = { x, y, plantId: selectedPlant, plantedDate: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) };
      setBed(prev => ({ ...prev, cells: [...prev.cells, newCell] }));
    }
  };

  const handleRemoveCell = (x: number, y: number) => {
    setBed(prev => ({ ...prev, cells: prev.cells.filter(c => !(c.x === x && c.y === y)) }));
    setSelectedCell(null);
  };

  const handleSave = () => {
    onSave({ ...bed, name });
    setEditing(false);
  };

  const popoverCell = selectedCell ? findCell(selectedCell.x, selectedCell.y) : null;
  const popoverPlant = popoverCell ? getPlant(popoverCell.plantId) : null;

  return (
    <div style={{ display: 'flex', height: '100%', gap: 0 }}>
      {/* Palette */}
      <div style={{ width: 196, borderRight: '1.6px solid var(--line)', background: 'var(--paper-2)', padding: '16px 14px', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--pen)', fontSize: 18, fontWeight: 600 }}>plantar</div>
        <Squiggle w={60} />

        <div style={{ marginTop: 12, fontFamily: 'var(--label)', fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          de temporada
        </div>
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {PLANTS.map(p => (
            <div key={p.id}
              className={`plant-palette-item ${editing && selectedPlant === p.id ? 'selected' : ''}`}
              style={{ background: cellColor(p.id), opacity: editing ? 1 : 0.6 }}
              onClick={() => { if (editing) setSelectedPlant(p.id); }}>
              <PlantGlyph kind={p.kind} size={15} />
              <span>{p.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, fontFamily: 'var(--label)', fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          herramientas
        </div>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--label)', fontSize: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', cursor: 'pointer', color: 'var(--ink-soft)' }}
            onClick={() => { if (editing && selectedCell) handleRemoveCell(selectedCell.x, selectedCell.y); }}>
            <Icon kind="trash" size={16} color="var(--ink-soft)" />
            <span>quitar planta</span>
          </div>
        </div>

        {editing && (
          <div style={{ marginTop: 16, fontFamily: 'var(--note)', fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
            tip: selecciona una planta y haz clic en una celda para plantarla
          </div>
        )}
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, padding: '22px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div onClick={onBack} style={{ cursor: 'pointer' }}>
              <Icon kind="arrow-l" size={22} color="var(--ink-soft)" />
            </div>
            <div>
              {editing ? (
                <input value={name} onChange={e => setName(e.target.value)}
                  style={{ fontFamily: 'var(--pen)', fontSize: 26, fontWeight: 600, background: 'transparent', border: 'none', borderBottom: '1.5px solid var(--terra)', outline: 'none', color: 'var(--ink)', width: 240 }} />
              ) : (
                <ScribbleTitle size={26}>{bed.name}</ScribbleTitle>
              )}
              <div style={{ fontFamily: 'var(--note)', fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
                {editing ? 'editando' : `${bed.w}×${bed.h} · ${bed.cells.length} plantas`}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? (
              <>
                <SketchButton width={90} fill="var(--paper)" onClick={() => { setEditing(false); setBed(initialBed); setName(initialBed.name); }}>cancelar</SketchButton>
                <SketchButton width={90} fill="var(--green-soft)" onClick={handleSave}>guardar</SketchButton>
              </>
            ) : (
              <SketchButton width={110} fill="var(--paper)" onClick={() => setEditing(true)}>
                <Icon kind="pencil" size={16} color="var(--ink-soft)" />
                <span style={{ marginLeft: 4 }}>editar</span>
              </SketchButton>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {/* Grid */}
          <div style={{ position: 'relative' }}>
            <RoughBox width={bed.w * CELL_SIZE + 26} height={bed.h * CELL_SIZE + 26}
              fill={BED_COLORS[bed.colorIdx % BED_COLORS.length]}
              seed={9} jitter={1.6} double>
              <div style={{
                padding: 13,
                display: 'grid',
                gridTemplateColumns: `repeat(${bed.w}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${bed.h}, ${CELL_SIZE}px)`,
                gap: 3,
              }}>
                {Array.from({ length: bed.w * bed.h }).map((_, i) => {
                  const x = i % bed.w, y = Math.floor(i / bed.w);
                  const cell = findCell(x, y);
                  const isSelected = selectedCell?.x === x && selectedCell?.y === y;
                  return (
                    <div key={i} className="bed-cell" onClick={() => handleCellClick(x, y)}>
                      <RoughBox width={CELL_SIZE} height={CELL_SIZE}
                        fill={cell ? cellColor(cell.plantId) : 'var(--paper)'}
                        seed={i * 13 + 1} jitter={0.9}
                        stroke={isSelected ? 'var(--terra)' : undefined}
                        strokeWidth={isSelected ? 2.2 : 1.6}>
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                          {cell ? (
                            <>
                              <PlantGlyph kind={cell.plantId as PlantKind} size={30} />
                              <div style={{ fontFamily: 'var(--label)', fontSize: 10, textAlign: 'center', lineHeight: 1 }}>
                                {getPlant(cell.plantId)?.name.split(' ')[0]}
                              </div>
                            </>
                          ) : (
                            editing ? <Icon kind="plus" size={16} color="var(--ink-faint)" /> : null
                          )}
                        </div>
                      </RoughBox>
                    </div>
                  );
                })}
              </div>
            </RoughBox>

            <div style={{ marginTop: 8, fontFamily: 'var(--note)', fontSize: 11, color: 'var(--ink-faint)', textAlign: 'center' }}>
              ↕ {(bed.h * 0.4).toFixed(1)} m  ·  ↔ {(bed.w * 0.4).toFixed(1)} m
            </div>
          </div>

          {/* Selected cell popover */}
          {selectedCell && popoverCell && popoverPlant && (
            <RoughBox width={200} height={140} fill="var(--paper)" seed={42} jitter={1.2}
              style={{ alignSelf: 'flex-start', transform: 'rotate(1.5deg)', marginTop: 8 }}>
              <div style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PlantGlyph kind={popoverPlant.kind} size={24} />
                  <div style={{ fontFamily: 'var(--pen)', fontSize: 17, fontWeight: 600 }}>{popoverPlant.name}</div>
                </div>
                <Dots w={160} />
                <div style={{ fontFamily: 'var(--note)', fontSize: 12, color: 'var(--ink-soft)', marginTop: 8, lineHeight: 1.5 }}>
                  plantada {popoverCell.plantedDate}<br />
                  riego: {'•'.repeat(popoverPlant.water)}<br />
                  sol: {popoverPlant.sun}
                </div>
                {editing && (
                  <div onClick={() => handleRemoveCell(selectedCell.x, selectedCell.y)}
                    style={{ marginTop: 8, fontFamily: 'var(--label)', fontSize: 12, color: 'var(--terra)', cursor: 'pointer' }}>
                    × quitar
                  </div>
                )}
              </div>
            </RoughBox>
          )}
        </div>

        {/* Plants list */}
        <div style={{ marginTop: 24, maxWidth: 500 }}>
          <div style={{ fontFamily: 'var(--pen)', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Plantado</div>
          <Squiggle w={80} />
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[...new Set(bed.cells.map(c => c.plantId))].map(pid => {
              const count = bed.cells.filter(c => c.plantId === pid).length;
              const p = getPlant(pid);
              if (!p) return null;
              const firstDate = bed.cells.find(c => c.plantId === pid)?.plantedDate || '';
              return (
                <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--note)', fontSize: 13 }}>
                  <PlantGlyph kind={p.kind} size={20} />
                  <div style={{ flex: 1 }}>{p.name}</div>
                  <span style={{ color: 'var(--ink-faint)' }}>×{count}</span>
                  <span style={{ color: 'var(--ink-faint)', width: 55, textAlign: 'right' }}>{firstDate}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
