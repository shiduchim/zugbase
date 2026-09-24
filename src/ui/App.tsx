import { layers, tab } from '../state';
import { Home } from './screens/Home';
import { People } from './screens/People';
import { PersonScreen } from './screens/Person';
import { PersonEdit } from './screens/PersonEdit';
import { GearIcon } from './parts/Icons';

const TABS: { key: typeof tab.value; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'shadchan', label: 'Shadchanim' },
  { key: 'guy', label: 'Guys' },
  { key: 'girl', label: 'Girls' }
];

export function App() {
  return (
    <>
      <div class="app-header">
        <div class="brand">zugbase</div>
        {tab.value === 'home' && (
          <button class="gear-btn" onClick={() => alert('Settings isn’t built yet')}>
            <GearIcon />
          </button>
        )}
      </div>

      {tab.value === 'home' && <Home />}
      {tab.value === 'shadchan' && <People role="shadchan" />}
      {tab.value === 'guy' && <People role="guy" />}
      {tab.value === 'girl' && <People role="girl" />}

      <div class="tabbar">
        {TABS.map((t) => (
          <button key={t.key} class={`tab ${tab.value === t.key ? 'active' : ''}`} onClick={() => (tab.value = t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {layers.value.map((layer, i) =>
        layer.kind === 'person' ? <PersonScreen key={i} id={layer.id} /> : <PersonEdit key={i} role={layer.role} id={layer.id} />
      )}
    </>
  );
}
