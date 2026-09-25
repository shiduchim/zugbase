import { useState } from 'preact/hooks';
import { useLive } from '../../hooks';
import { db } from '../../db';
import { addMemo, deleteMemo, listCallsDue, listMemos, listRecentlyAdded, searchAll, setCallDue, getSettings } from '../../repo';
import { countForNode, rootsForMode } from '../../folders';
import type { Folder, Memo, Person } from '../../types';
import { browsePath, mode, openPerson, tab } from '../../state';
import { runBackup } from '../../backup/backup';

async function livePeople(): Promise<Person[]> {
  return db.people.filter((p) => !p.deletedAt).toArray();
}
async function listFolders(): Promise<Folder[]> {
  return db.folders.toArray();
}

function dueLabel(due: number): string {
  const days = Math.round((due - new Date().setHours(0, 0, 0, 0)) / 86_400_000);
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return new Date(due).toLocaleDateString();
}

function AddCallDue() {
  const [query, setQuery] = useState('');
  const results = useLive(() => searchAll(query), [query], [] as Person[]);
  return (
    <div>
      <input class="search" placeholder="Search anyone…" value={query} onInput={(e) => setQuery(e.currentTarget.value)} />
      {results.map((p) => (
        <div key={p.id} class="home-row">
          <span>{p.name}</span>
          <button class="link-btn" onClick={() => setCallDue(p.id, Date.now())}>
            Call today
          </button>
        </div>
      ))}
    </div>
  );
}

export function Home() {
  const allPeople = useLive(livePeople, [], [] as Person[]);
  const allFolders = useLive(listFolders, [], [] as Folder[]);
  const callsDue = useLive(listCallsDue, [], [] as Person[]);
  const memos = useLive(listMemos, [], [] as Memo[]);
  const recent = useLive(() => listRecentlyAdded(5), [], [] as Person[]);
  const settings = useLive(getSettings, [], undefined as Awaited<ReturnType<typeof getSettings>> | undefined);
  const [addingCall, setAddingCall] = useState(false);
  const [memoText, setMemoText] = useState('');
  const [backingUp, setBackingUp] = useState(false);
  const [backupMsg, setBackupMsg] = useState('');

  async function saveMemo() {
    if (!memoText.trim()) return;
    await addMemo(memoText.trim());
    setMemoText('');
  }

  async function doBackup() {
    setBackingUp(true);
    try {
      await runBackup();
      setBackupMsg('Saved just now');
    } catch (e) {
      setBackupMsg('Backup failed — see console');
      console.error(e);
    } finally {
      setBackingUp(false);
    }
  }

  return (
    <div class="screen">
      <div class="section-title">Folders</div>
      <div class="folder-tiles">
        {rootsForMode(mode.value).map((r) => (
          <button
            key={r.key}
            class="folder-tile"
            style="text-align:left"
            onClick={() => {
              browsePath.value = [r.key];
              tab.value = 'browse';
            }}
          >
            <div class="t-count">{countForNode(r.key, allFolders, allPeople)}</div>
            <div class="t-label">{r.label}</div>
          </button>
        ))}
      </div>

      {settings?.mode === 'single' && (
        <div class="home-card card">
          <div class="section-title" style="margin:0 0 6px">
            My profile
          </div>
          <div class="sub" style="color:var(--muted);font-size:12.5px">
            I am a single {settings.iAm}. Change this in Settings.
          </div>
        </div>
      )}

      <div class="home-card card">
        <div class="section-title" style="margin:0 0 8px">
          Calls due
        </div>
        {callsDue.length === 0 && <div class="empty">Nothing due</div>}
        {callsDue.map((p) => (
          <div key={p.id} class="home-row" onClick={() => openPerson(p.id)}>
            <span>{p.name}</span>
            <span class="when">{dueLabel(p.nextStepDue!)}</span>
          </div>
        ))}
        {addingCall ? (
          <AddCallDue />
        ) : (
          <button class="link-add" onClick={() => setAddingCall(true)}>
            + Add someone to Calls due
          </button>
        )}
      </div>

      <div class="home-card card">
        <div class="section-title" style="margin:0 0 8px">
          Memos
        </div>
        {memos.length === 0 && <div class="empty">No memos yet</div>}
        {memos.map((m) => (
          <div key={m.id} class="home-row">
            <span>{m.text}</span>
            <button class="link-btn" style="padding:0;color:var(--danger)" onClick={() => deleteMemo(m.id)}>
              ✕
            </button>
          </div>
        ))}
        <div class="phone-line" style="margin-top:8px">
          <input placeholder="Note to myself…" value={memoText} onInput={(e) => setMemoText(e.currentTarget.value)} />
        </div>
        <button class="link-add" onClick={saveMemo}>
          Add memo
        </button>
      </div>

      <div class="home-card card">
        <div class="section-title" style="margin:0 0 8px">
          Recently added
        </div>
        {recent.length === 0 && <div class="empty">Nothing yet</div>}
        {recent.map((p) => (
          <div key={p.id} class="home-row" onClick={() => openPerson(p.id)}>
            <span>{p.name}</span>
            <span class="when">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}</span>
          </div>
        ))}
      </div>

      <div class="last-backup">
        {settings?.lastBackupAt ? `Last backup: ${new Date(settings.lastBackupAt).toLocaleString()}` : 'Last backup: never'}
        {backupMsg && ` · ${backupMsg}`}
      </div>
      <button class="backup-now" disabled={backingUp} onClick={doBackup}>
        {backingUp ? 'Backing up…' : 'Backup now'}
      </button>
    </div>
  );
}
