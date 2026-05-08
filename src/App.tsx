import { useState } from 'react';
import type { Screen } from './types';
import { useStore } from './hooks/useStore';
import { PLANTS } from './data/plants';
import { Overview } from './screens/Overview';
import { BedEditor } from './screens/BedEditor';
import { Calendar } from './screens/Calendar';
import { History } from './screens/History';
import { Catalog, PlantDetail } from './screens/Catalog';
import { NewBedModal } from './components/NewBedModal';
import { AddPlantModal } from './components/AddPlantModal';
import { Icon, Squiggle } from './components/Sketchy';

const NAV: { screen: Screen; icon: string; label: string }[] = [
  { screen: 'overview',  icon: 'home',     label: 'huerto' },
  { screen: 'calendar',  icon: 'calendar', label: 'cuándo' },
  { screen: 'catalog',   icon: 'leaf',     label: 'plantas' },
  { screen: 'history',   icon: 'book',     label: 'diario' },
];

export default function App() {
  const { beds, diary, addBed, updateBed, addEntry, customPlants, addCustomPlant } = useStore();
  const [screen, setScreen] = useState<Screen>('overview');
  const [activeBedId, setActiveBedId] = useState<string | null>(null);
  const [activePlantId, setActivePlantId] = useState<string | null>(null);
  const [showNewBed, setShowNewBed] = useState(false);
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 640);

  const allPlants = [...PLANTS, ...customPlants];

  const navigateTo = (s: Screen) => {
    setScreen(s);
    setActiveBedId(null);
    setActivePlantId(null);
    if (window.innerWidth <= 640) setSidebarOpen(false);
  };

  const handleSelectBed = (id: string) => { setActiveBedId(id); setScreen('bed'); };
  const handleNewBed = () => setShowNewBed(true);
  const handleSelectPlant = (id: string) => { setActivePlantId(id); setScreen('plant-detail'); };

  const activeBed = beds.find(b => b.id === activeBedId);

  return (
    <div className="app-layout">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <div style={{ fontFamily: 'var(--pen)', fontSize: 22, fontWeight: 700 }}>Smart</div>
            <div style={{ fontFamily: 'var(--pen)', fontSize: 22, fontWeight: 700, color: 'var(--green)', lineHeight: 0.9 }}>Garden</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ padding: '4px 6px', marginTop: 2, background: 'none', border: '1px solid transparent', cursor: 'pointer', borderRadius: 2 }}
            title="Cerrar menú"
          >
            <Icon kind="arrow-l" size={16} color="var(--ink-faint)" />
          </button>
        </div>
        <Squiggle w={70} />

        <nav style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {NAV.map(n => (
            <div key={n.screen}
              className={`nav-item ${screen === n.screen || (n.screen === 'overview' && screen === 'bed') ? 'active' : ''}`}
              onClick={() => navigateTo(n.screen)}>
              <Icon kind={n.icon} size={18} color={screen === n.screen ? 'var(--terra)' : 'var(--ink-soft)'} />
              <span>{n.label}</span>
            </div>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', fontFamily: 'var(--note)', fontSize: 11, color: 'var(--ink-faint)', paddingTop: 16 }}>
          Galicia · clima atlántico
        </div>
      </aside>

      {/* Main */}
      <main className="main-area">
        <button className="menu-toggle" onClick={() => setSidebarOpen(v => !v)} title="Menú">
          <Icon kind="list" size={18} color="var(--ink)" />
        </button>

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
        {screen === 'catalog' && (
          <Catalog
            plants={allPlants}
            onSelectPlant={handleSelectPlant}
            onAddPlant={() => setShowAddPlant(true)}
          />
        )}
        {screen === 'plant-detail' && activePlantId && (
          <PlantDetail
            plants={allPlants}
            plantId={activePlantId}
            onBack={() => navigateTo('catalog')}
          />
        )}
      </main>

      {/* Modals */}
      {showNewBed && (
        <NewBedModal
          onSave={b => { addBed(b); setShowNewBed(false); handleSelectBed(b.id); }}
          onCancel={() => setShowNewBed(false)}
        />
      )}
      {showAddPlant && (
        <AddPlantModal
          onSave={p => { addCustomPlant(p); setShowAddPlant(false); }}
          onCancel={() => setShowAddPlant(false)}
        />
      )}
    </div>
  );
}
