import { useState } from 'preact/hooks';
import { useLive } from '../../hooks';
import { addMemo, listCallsDue, listMemos, listRecentlyAdded, searchAll, setCallDue } from '../../repo';
import type { Person } from '../../types';
import { openPerson } from '../../state';

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
  const callsDue = useLive(listCallsDue, [], [] as Person[]);
  const memos = useLive(listMemos, [], [] as { id: string; text: string; createdAt: number }[]);
  const recent = useLive(() => listRecentlyAdded(5), [], [] as Person[]);
  const [addingCall, setAddingCall] = useState(false);
  const [memoText, setMemoText] = useState('');
  const [backupMsg, setBackupMsg] = useState('');

  async function saveMemo() {
    if (!memoText.trim()) return;
    await addMemo(memoText.trim());
    setMemoText('');
  }

  return (
    <div class="screen">
      <div class="home-card card">
        <h2>Calls due</h2>
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
        <h2>Memos</h2>
        {memos.length === 0 && <div class="empty">No memos yet</div>}
        {memos.map((m) => (
          <div key={m.id} class="home-row">
            <span>{m.text}</span>
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
        <h2>Recently added</h2>
        {recent.length === 0 && <div class="empty">Nothing yet</div>}
        {recent.map((p) => (
          <div key={p.id} class="home-row" onClick={() => openPerson(p.id)}>
            <span>{p.name}</span>
            <span class="when">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}</span>
          </div>
        ))}
      </div>

      <div class="last-backup">Last backup: never{backupMsg && ` · ${backupMsg}`}</div>
      <button class="backup-now" onClick={() => setBackupMsg('Backup isn’t built yet')}>
        Backup now
      </button>
    </div>
  );
}
