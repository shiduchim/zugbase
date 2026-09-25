import { useRef, useState } from 'preact/hooks';
import { useLive } from '../../hooks';
import { getSettings, updateSettings } from '../../repo';
import { runBackup, runBackupAsTxt, restoreFromFile } from '../../backup/backup';
import { closeTop, openDeleted } from '../../state';
import { Sheet } from '../parts/common';
import { BackIcon } from '../parts/Icons';
import type { Settings as SettingsType } from '../../types';

export function SettingsScreen() {
  const settings = useLive(getSettings, [], undefined as SettingsType | undefined);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  if (!settings) return null;

  async function restore(file: File) {
    if (!confirm('Restore will replace everything currently on this device with the backup. Continue?')) return;
    try {
      const counts = await restoreFromFile(file);
      setMsg(`Restored: ${counts.people} people, ${counts.folders} folders, ${counts.memos} memos`);
    } catch (e) {
      setMsg(String(e instanceof Error ? e.message : e));
    }
  }

  return (
    <Sheet full>
      <div class="person-header">
        <button class="back-btn" onClick={closeTop}>
          <BackIcon />
        </button>
        <div class="name">Settings</div>
      </div>

      <div class="settings-list">
        <div class="settings-row">
          <div>
            <div class="s-label">Mode</div>
            <div class="s-sub">Single: just your own search. Shadchan: everyone you help match.</div>
          </div>
        </div>
        <div class="mode-toggle" style="margin:0 0 8px">
          <button
            class={settings.mode === 'single' ? 'active' : ''}
            onClick={() => updateSettings((s) => (s.mode = 'single'))}
          >
            Single
          </button>
          <button
            class={settings.mode === 'shadchan' ? 'active' : ''}
            onClick={() => updateSettings((s) => (s.mode = 'shadchan'))}
          >
            Shadchan
          </button>
        </div>

        <div class="settings-row">
          <div class="s-label">I am</div>
        </div>
        <div class="mode-toggle" style="margin:0 0 8px">
          <button class={settings.iAm === 'guy' ? 'active' : ''} onClick={() => updateSettings((s) => (s.iAm = 'guy'))}>
            A single guy
          </button>
          <button class={settings.iAm === 'girl' ? 'active' : ''} onClick={() => updateSettings((s) => (s.iAm = 'girl'))}>
            A single girl
          </button>
        </div>

        <div class="settings-row">
          <div>
            <div class="s-label">Keep deleted people for</div>
            <div class="s-sub">Recoverable, then purged for good</div>
          </div>
          <input
            type="number"
            style="width:60px;border:1px solid var(--line);border-radius:8px;padding:6px;text-align:center"
            value={settings.waitDays}
            onInput={(e) => updateSettings((s) => (s.waitDays = Number(e.currentTarget.value) || 30))}
          />
        </div>

        <div class="settings-row" onClick={openDeleted} style="cursor:pointer">
          <div class="s-label">Recently deleted</div>
          <span>›</span>
        </div>

        <div class="settings-row">
          <div class="s-label">Backup</div>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" style="flex:1" onClick={runBackup}>
            Save ZIP
          </button>
          <button class="btn btn-ghost" style="flex:1" onClick={runBackupAsTxt}>
            Email (TXT)
          </button>
        </div>
        <button class="link-btn" onClick={() => fileRef.current?.click()}>
          Restore from a backup…
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".zip,.txt"
          style="display:none"
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            if (file) restore(file);
          }}
        />
        {msg && <div class="sub" style="color:var(--muted);font-size:12px;padding:8px 0">{msg}</div>}
      </div>
    </Sheet>
  );
}
