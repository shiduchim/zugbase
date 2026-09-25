import { useEffect } from 'preact/hooks';
import { useLive } from '../hooks';
import { getSettings } from '../repo';
import { browsePath, layers, mode as modeSignal, openMatch, openSettings, tab } from '../state';
import { rootsForMode } from '../folders';
import { Home } from './screens/Home';
import { Browse } from './screens/Browse';
import { Intake } from './screens/Intake';
import { PersonScreen } from './screens/Person';
import { PersonEdit } from './screens/PersonEdit';
import { SettingsScreen } from './screens/Settings';
import { DeletedScreen } from './screens/Deleted';
import { MakeMatch } from './screens/MakeMatch';
import { GearIcon, HomeIcon, PeopleIcon, FolderIcon } from './parts/Icons';
import { ToastHost } from './parts/Toast';
import type { Settings } from '../types';

export function App() {
  const settings = useLive(getSettings, [], undefined as Settings | undefined);
  useEffect(() => {
    if (!settings) return;
    modeSignal.value = settings.mode;
    const roots = rootsForMode(settings.mode);
    if (!roots.some((r) => r.key === browsePath.value[0])) browsePath.value = [roots[0]!.key];
  }, [settings?.mode]);

  return (
    <>
      <div class="topbar">
        <div class="brand">zugbase</div>
        <div class="spacer" />
        {modeSignal.value === 'shadchan' && (
          <button class="icon-btn" onClick={openMatch}>
            Match
          </button>
        )}
        {tab.value === 'home' && (
          <button class="icon-btn" onClick={openSettings}>
            <GearIcon />
          </button>
        )}
      </div>

      {tab.value === 'home' && <Home />}
      {tab.value === 'browse' && <Browse />}
      {tab.value === 'intake' && <Intake />}

      <div class="tabbar">
        <button class={`tab ${tab.value === 'home' ? 'active' : ''}`} onClick={() => (tab.value = 'home')}>
          <HomeIcon />
          Home
        </button>
        <button class={`tab ${tab.value === 'browse' ? 'active' : ''}`} onClick={() => (tab.value = 'browse')}>
          <PeopleIcon />
          Browse
        </button>
        <button class={`tab ${tab.value === 'intake' ? 'active' : ''}`} onClick={() => (tab.value = 'intake')}>
          <FolderIcon />
          Intake
        </button>
      </div>

      {layers.value.map((layer, i) => {
        if (layer.kind === 'person') return <PersonScreen key={i} id={layer.id} />;
        if (layer.kind === 'edit') return <PersonEdit key={i} role={layer.role} id={layer.id} />;
        if (layer.kind === 'settings') return <SettingsScreen key={i} />;
        if (layer.kind === 'deleted') return <DeletedScreen key={i} />;
        if (layer.kind === 'match') return <MakeMatch key={i} />;
        return null;
      })}

      <ToastHost />
    </>
  );
}
