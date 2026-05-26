import React, { useState } from 'react';
import { PlantGlyph, ScribbleTitle, Icon } from '../components/Sketchy';
import { PLANTS } from '../data/plants';

const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const MONTH_NAMES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

type View = 'table' | 'month';

export function Calendar() {
  const [view, setView] = useState<View>('table');
  const [month, setMonth] = useState(new Date().getMonth());

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <ScribbleTitle size={28}>Qué plantar cuándo</ScribbleTitle>
          <div style={{ fontFamily: 'var(--note)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 8 }}>
            Galicia · clima atlántico
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['table','month'] as View[]).map(v => (
            <div key={v} onClick={() => setView(v)} style={{ padding: '4px 14px', background: view === v ? 'var(--terra-soft)' : 'var(--paper)', border: '1.4px solid var(--line)', fontFamily: 'var(--label)', fontSize: 13, cursor: 'pointer', borderRadius: 3 }}>
              {v === 'table' ? 'tabla anual' : 'mes actual'}
            </div>
          ))}
        </div>
      </div>

      {view === 'table' ? <TableView /> : <MonthView month={month} onMonth={setMonth} />}
    </div>
  );
}

function TableView() {
  const CW = 38;
  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, fontFamily: 'var(--label)', fontSize: 12 }}>
        <LegendItem color="var(--green-soft)" label="sembrar" />
        <LegendItem color="var(--terra-soft)" label="trasplantar" />
        <LegendItem color="var(--yellow-soft)" label="cosechar" />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `160px repeat(12, ${CW}px)`, gap: 0, fontFamily: 'var(--label)', minWidth: 640 }}>
          {/* header */}
          <div />
          {MONTHS.map((m, i) => (
            <div key={i} style={{ fontSize: 12, color: i === 3 ? 'var(--terra)' : 'var(--ink-soft)', fontWeight: i === 3 ? 700 : 400, textAlign: 'center', paddingBottom: 8, textTransform: 'uppercase' }}>{m}</div>
          ))}

          {PLANTS.map((p) => (
            <React.Fragment key={p.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0', borderTop: '1px dashed rgba(0,0,0,0.15)', fontSize: 14 }}>
                <PlantGlyph kind={p.kind} size={18} />
                {p.name}
              </div>
              {MONTHS.map((_, mi) => {
                const sow = p.sow.includes(mi);
                const plant = p.plant.includes(mi);
                const harvest = p.harvest.includes(mi);
                return (
                  <div key={mi} style={{ borderTop: '1px dashed rgba(0,0,0,0.15)', padding: '5px 3px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    {sow && <Pill color="var(--green-soft)" />}
                    {plant && <Pill color="var(--terra-soft)" />}
                    {harvest && <Pill color="var(--yellow-soft)" />}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* current month indicator line */}
      <div style={{ marginTop: 8, fontFamily: 'var(--note)', fontSize: 12, color: 'var(--terra)' }}>
        ↑ La columna {MONTHS[new Date().getMonth()].toUpperCase()} es el mes actual
      </div>
    </div>
  );
}

function MonthView({ month, onMonth }: { month: number; onMonth: (m: number) => void }) {
  const now = PLANTS.filter(p => p.sow.includes(month));
  const transplant = PLANTS.filter(p => p.plant.includes(month));
  const harvest = PLANTS.filter(p => p.harvest.includes(month));

  return (
    <div style={{ maxWidth: 540 }}>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div onClick={() => onMonth((month - 1 + 12) % 12)} style={{ cursor: 'pointer' }}>
          <Icon kind="arrow-l" size={22} color="var(--ink-soft)" />
        </div>
        <div style={{ fontFamily: 'var(--pen)', fontSize: 24, fontWeight: 700, flex: 1, textAlign: 'center' }}>
          {MONTH_NAMES[month]}
        </div>
        <div onClick={() => onMonth((month + 1) % 12)} style={{ cursor: 'pointer' }}>
          <Icon kind="arrow-r" size={22} color="var(--ink-soft)" />
        </div>
      </div>

      <MonthSection title="sembrar ahora" plants={now} color="var(--green-soft)" />
      <MonthSection title="trasplantar" plants={transplant} color="var(--terra-soft)" />
      <MonthSection title="cosechar" plants={harvest} color="var(--yellow-soft)" />

      {/* tip */}
      <div style={{ marginTop: 20, background: 'var(--paper-2)', border: '1.4px solid var(--line)', padding: '12px 16px', display: 'flex', gap: 12 }}>
        <span style={{ fontFamily: 'var(--pen)', fontSize: 22, color: 'var(--terra)' }}>💡</span>
        <div style={{ fontFamily: 'var(--note)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
          <strong>tip de {MONTH_NAMES[month]}:</strong> Consulta la tabla anual para ver el panorama completo del año.
        </div>
      </div>
    </div>
  );
}

function MonthSection({ title, plants, color }: { title: string; plants: typeof PLANTS; color: string }) {
  if (plants.length === 0) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: 'var(--pen)', fontSize: 19, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {plants.map(p => (
          <div key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: color, padding: '6px 12px', border: '1.2px solid var(--line)', fontFamily: 'var(--label)', fontSize: 14 }}>
            <PlantGlyph kind={p.kind} size={20} />
            {p.name}
          </div>
        ))}
      </div>
    </div>
  );
}

function Pill({ color }: { color: string }) {
  return <div style={{ width: 8, height: 14, background: color, border: '1.2px solid var(--line)', borderRadius: 3 }} />;
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 14, height: 14, background: color, border: '1.2px solid var(--line)', borderRadius: 3 }} />
      <span style={{ color: 'var(--ink-soft)', fontFamily: 'var(--label)', fontSize: 12 }}>{label}</span>
    </div>
  );
}
