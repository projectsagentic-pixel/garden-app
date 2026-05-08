import { useState } from 'react';
import type { Screen } from './types';
import { useStore } from './hooks/useStore';
import { Overview } from './screens/Overview';
import { BedEditor } from './screens/BedEditor';
import { Calendar } from './screens/Calendar';
import { History } from './screens/History';
import { Catalog, PlantDetail } from './screens/Catalog';
import { NewBedModal } from './components/NewBedModal';
import { Icon, Squiggle } from './components/Sketchy';

const NAV: { screen: Screen; icon: string; label: string }[] = [
  { screen: 'overview',  icon: 'home',     label: 'huerto' },
  { screen: 'calendar',  icon: 'calendar', label: 'cuándo' },
  { screen: 'catalog',   icon: 'leaf',     label: 'plantas' },
  { screen: 'history',   icon: 'book',     label: 'diario' },
];

export default function App() {
  const { beds, diary, addBed, updateBed, addEntry } = useStore();
  const [screen, setScreen] = useState<Screen>('overview');
  const [activeBedId, setActiveBedId] = useState<string | null>(null);
  const [activePlantId, setActivePlantId] = useState<string | null>(null);
  const [showNewBed, setShowNewBed] = useState(false);

  const navigateTo = (s: Screen) => { setScreen(s); setActiveBedId(null); setActivePlantId(null); };

  const handleSelectBed = (id: string) => { setActiveBedId(id); setScreen('bed'); };
  const handleNewBed = () => setShowNewBed(true);
  const handleSelectPlant = (id: string) => { setActivePlantId(id); setScreen('plant-detail'); };

  const activeBed = beds.find(b => b.id === activeBedId);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontFamily: 'var(--pen)', fontSize: 22, fontWeight: 700 }}>Smart</div>
          <div style={{ fontFamily: 'var(--pen)', fontSize: 22, fontWeight: 700, color: 'var(--green)', lineHeight: 0.9 }}>Garden</div>
        </div>
        <Squiggle w={70} />

        <nav style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {NAV.map(n => (
            <div key={n.screen} className={`nav-item ${screen === n.screen || (n.screen === 'overview' && screen === 'bed') ? 'active' : ''}`}
              onClick={() => navigateTo(n.screen)}>
              <Icon kind={n.icon} size={18} color={screen === n.screen ? 'var(--terra)' : 'var(--ink-soft)'} />
              <span>{n.label}</span>
            </div>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', fontFamily: 'var(--note)', fontSize: 12, color: 'var(--ink-faint)', paddingTop: 16 }}>
          📍 Madrid · zona 9
        </div>
      </aside>

      {/* Main */}
      <main className="main-area">
        {screen === 'overview' && (
          <Overview beds={beds} onSelectBed={handleSelectBed} onNewBed={handleNewBed} />
        )}
        {screen === 'bed' && activeBed && (
          <BedEditor
            bed={activeBed}
            onSave={b => { updateBed(b); }}
            onBack={() => navigateTo('overview')}
          />
        )}
        {screen === 'calendar' && <Calendar />}
        {screen === 'history' && <History entries={diary} beds={beds} onAdd={addEntry} />}
        {screen === 'catalog' && <Catalog onSelectPlant={handleSelectPlant} />}
        {screen === 'plant-detail' && activePlantId && (
          <PlantDetail plantId={activePlantId} onBack={() => navigateTo('catalog')} />
        )}
      </main>

      {/* Modal */}
      {showNewBed && (
        <NewBedModal
          onSave={b => { addBed(b); setShowNewBed(false); handleSelectBed(b.id); }}
          onCancel={() => setShowNewBed(false)}
        />
      )}
    </div>
  );
}
