import { useMemo, useState } from 'preact/hooks';
import { useLive } from '../../hooks';
import { db } from '../../db';
import {
  countForNode,
  createFolder,
  deleteFolder,
  directChildren,
  directPeople,
  folderName,
  peopleInSubtree,
  removeFromFolder,
  rootOf,
  rootsForMode,
  undoDeleteFolder,
  undoFolderChange
} from '../../folders';
import { getSettings, restorePerson, softDelete } from '../../repo';
import type { Folder, Person, Role } from '../../types';
import { browsePath, mode, openEdit, openPerson, showToast, zoom } from '../../state';
import { currentAge } from '../../lib/age';
import { formatLocal } from '../../lib/phone';
import { ChevronIcon, FolderIcon, PlusIcon, SearchIcon } from '../parts/Icons';
import { Pill } from '../parts/common';
import { FolderPicker } from '../parts/FolderPicker';

async function livePeople(): Promise<Person[]> {
  return db.people.filter((p) => !p.deletedAt).toArray();
}
async function listFolders(): Promise<Folder[]> {
  return db.folders.toArray();
}

const ROOT_ROLE: Record<string, Role> = {
  'root:guys': 'guy',
  'root:girls': 'girl',
  'root:shadchanim': 'shadchan',
  'root:others': 'other'
};

function FolderRow(props: { id: string; name: string; count: number; onOpen: () => void; onDelete?: () => void }) {
  const [menu, setMenu] = useState(false);
  return (
    <div class="folder-row">
      <span class="ficon">
        <FolderIcon />
      </span>
      <div class="fname" onClick={props.onOpen}>
        {props.name}
      </div>
      <span class="fcount">{props.count}</span>
      <span class="chevron" onClick={props.onOpen}>
        <ChevronIcon />
      </span>
      {props.onDelete && (
        <div style="position:relative">
          <button class="kebab" onClick={() => setMenu((m) => !m)}>
            ⋯
          </button>
          {menu && (
            <div class="kebab-menu">
              <button
                onClick={() => {
                  setMenu(false);
                  props.onDelete?.();
                }}
              >
                Delete folder
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PersonRow(props: { p: Person; selected: boolean; onToggle: () => void; details: boolean }) {
  const { p } = props;
  const age = currentAge(p.age);
  const phone = p.role === 'shadchan' ? p.phone : p.profilePhone;
  return (
    <div class={`row ${p.waitingForReply ? 'waiting' : ''} ${props.details ? '' : 'names'}`}>
      <input type="checkbox" class="checkbox" checked={props.selected} onChange={props.onToggle} />
      <div class="info" onClick={() => openPerson(p.id)}>
        <div class="name">{p.name || '(no name)'}</div>
        {props.details && (
          <>
            <div class="meta">
              {age !== undefined && <Pill label={`Age ${age}`} />}
              {p.suggestedToMe && <Pill label="Suggested to me" />}
            </div>
            {phone && <div class="sub">{formatLocal(phone)}</div>}
            {p.activities[0]?.text && <div class="sub">{p.activities[0].text}</div>}
          </>
        )}
      </div>
    </div>
  );
}

export function Browse() {
  const allPeople = useLive(livePeople, [], [] as Person[]);
  const allFolders = useLive(listFolders, [], [] as Folder[]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [picker, setPicker] = useState<'add' | 'move' | null>(null);

  const path = browsePath.value;
  const currentId = path[path.length - 1]!;
  const roots = rootsForMode(mode.value);

  const children = useMemo(() => directChildren(currentId, allFolders), [currentId, allFolders]);
  const direct = useMemo(() => directPeople(currentId, allPeople), [currentId, allPeople]);
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return peopleInSubtree(currentId, allFolders, allPeople).filter((p) =>
      [p.name, p.text, p.profilePhone, p.phone, p.tags].filter(Boolean).some((f) => f!.toLowerCase().includes(q))
    );
  }, [query, currentId, allFolders, allPeople]);

  const waitingCount = (searchResults ?? direct).filter((p) => p.waitingForReply).length;
  const isRoot = currentId.startsWith('root:');
  const currentName = folderName(currentId, mode.value, allFolders);

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function enter(id: string) {
    browsePath.value = [...path, id];
    setSelected(new Set());
    setQuery('');
  }

  async function addPerson() {
    const root = rootOf(currentId, allFolders);
    if (root === 'root:ideas') {
      const settings = await getSettings();
      openEdit(settings.iAm === 'guy' ? 'girl' : 'guy', undefined);
      return;
    }
    openEdit(ROOT_ROLE[root] ?? 'guy', undefined);
  }

  async function doDelete() {
    const ids = [...selected];
    setSelected(new Set());
    await Promise.all(ids.map((id) => softDelete(id)));
    showToast(`Deleted ${ids.length}`, () => Promise.all(ids.map((id) => restorePerson(id))));
  }

  async function takeOut() {
    if (isRoot) return;
    const ids = [...selected];
    setSelected(new Set());
    const snapshot = await removeFromFolder(ids, currentId);
    showToast('Removed from this folder', () => undoFolderChange(snapshot));
  }

  async function removeFolder(f: Folder) {
    const snap = await deleteFolder(f.id);
    if (snap) showToast(`Deleted folder "${f.name}"`, () => undoDeleteFolder(snap));
  }

  return (
    <div class="screen">
      <div class="pills" style="padding-top:2px">
        {roots.map((r) => (
          <button
            key={r.key}
            class={`pill ${path[0] === r.key ? 'gold' : ''}`}
            onClick={() => {
              browsePath.value = [r.key];
              setSelected(new Set());
              setQuery('');
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {path.length > 1 && (
        <div class="breadcrumb">
          {path.map((id, i) => (
            <span key={id} style="display:flex;align-items:center">
              {i > 0 && <span class="sep">›</span>}
              <button onClick={() => (browsePath.value = path.slice(0, i + 1))}>{folderName(id, mode.value, allFolders)}</button>
            </span>
          ))}
        </div>
      )}

      <h1 class="page-title">{currentName}</h1>
      <div class="pills">
        <Pill label={`Waiting for reply ${waitingCount}`} on={waitingCount > 0} />
      </div>

      <div class="toolbar">
        <div class="search" style="display:flex;align-items:center;gap:6px;flex:1">
          <SearchIcon />
          <input
            style="border:none;outline:none;flex:1;font-size:14px;background:none"
            placeholder="Search here"
            value={query}
            onInput={(e) => setQuery(e.currentTarget.value)}
          />
        </div>
        <div class="zoom-tri">
          <button class={zoom.value === 'folders' ? 'active' : ''} onClick={() => (zoom.value = 'folders')}>
            Folders
          </button>
          <button class={zoom.value === 'names' ? 'active' : ''} onClick={() => (zoom.value = 'names')}>
            Names
          </button>
          <button class={zoom.value === 'details' ? 'active' : ''} onClick={() => (zoom.value = 'details')}>
            Details
          </button>
        </div>
      </div>
      <div class="toolbar" style="padding-top:0">
        <button class="btn btn-ghost" onClick={() => setCreating((c) => !c)}>
          <PlusIcon /> Folder
        </button>
        <button class="btn btn-primary" style="flex:1" onClick={addPerson}>
          + Add
        </button>
      </div>

      {creating && (
        <div class="toolbar" style="padding-top:0">
          <input class="search" placeholder="New folder name" value={newName} onInput={(e) => setNewName(e.currentTarget.value)} />
          <button
            class="btn btn-primary"
            onClick={async () => {
              if (!newName.trim()) return;
              await createFolder(newName.trim(), currentId);
              setNewName('');
              setCreating(false);
            }}
          >
            Create
          </button>
        </div>
      )}

      {selected.size > 0 && (
        <div class="selection-bar">
          <div class="label">Share this profile</div>
          <div class="share-btns">
            <button>Email</button>
            <button>SMS</button>
            <button>WhatsApp</button>
          </div>
          <div class="selection-meta">
            <span>{selected.size} selected</span>
            <button onClick={() => setPicker('add')}>Add to…</button>
            {!isRoot && <button onClick={() => setPicker('move')}>Move to…</button>}
            {!isRoot && <button onClick={takeOut}>Take out</button>}
            <button class="danger" onClick={doDelete}>
              Delete
            </button>
            <button onClick={() => setSelected(new Set())}>Clear</button>
          </div>
        </div>
      )}

      <div class="rows">
        {searchResults ? (
          searchResults.length === 0 ? (
            <div class="empty-state">No matches here</div>
          ) : (
            searchResults.map((p) => <PersonRow key={p.id} p={p} selected={selected.has(p.id)} onToggle={() => toggle(p.id)} details />)
          )
        ) : (
          <>
            {children.map((f) => (
              <FolderRow
                key={f.id}
                id={f.id}
                name={f.name}
                count={countForNode(f.id, allFolders, allPeople)}
                onOpen={() => enter(f.id)}
                onDelete={() => removeFolder(f)}
              />
            ))}
            {zoom.value !== 'folders' &&
              direct.map((p) => (
                <PersonRow key={p.id} p={p} selected={selected.has(p.id)} onToggle={() => toggle(p.id)} details={zoom.value === 'details'} />
              ))}
            {children.length === 0 && direct.length === 0 && <div class="empty-state">Nothing here yet</div>}
          </>
        )}
      </div>

      {picker && (
        <FolderPicker
          personIds={[...selected]}
          moveFromFolderId={picker === 'move' ? currentId : undefined}
          onClose={() => {
            setPicker(null);
            setSelected(new Set());
          }}
        />
      )}
    </div>
  );
}
