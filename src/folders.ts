/* The one owner for folders: tree, counts, and bulk membership changes with Undo.
   Built-in root folders are virtual — computed from role/suggestedToMe — so they can never be
   deleted or emptied by mistake. Only custom folders are real rows, and removing someone from
   one never deletes them (folders are labels). */
import { db } from './db';
import type { Folder, Mode, Person, RootFolderKey } from './types';
import { newId } from './lib/ids';

export interface RootDef {
  key: RootFolderKey;
  label: string;
}

export function rootsForMode(mode: Mode): RootDef[] {
  if (mode === 'single') {
    return [
      { key: 'root:ideas', label: 'Ideas for me' },
      { key: 'root:shadchanim', label: 'Shadchanim' },
      { key: 'root:others', label: 'Other people' }
    ];
  }
  return [
    { key: 'root:guys', label: 'Guys' },
    { key: 'root:girls', label: 'Girls' },
    { key: 'root:shadchanim', label: 'Shadchanim' },
    { key: 'root:ideas', label: 'Ideas for me' }
  ];
}

export function matchesRoot(p: Person, key: RootFolderKey): boolean {
  if (key === 'root:ideas') return !!p.suggestedToMe;
  if (key === 'root:guys') return p.role === 'guy';
  if (key === 'root:girls') return p.role === 'girl';
  if (key === 'root:shadchanim') return p.role === 'shadchan';
  if (key === 'root:others') return p.role === 'other' || ((p.role === 'guy' || p.role === 'girl') && !p.suggestedToMe);
  return false;
}

export async function livePeople(): Promise<Person[]> {
  return db.people.filter((p) => !p.deletedAt).toArray();
}

export async function peopleInRoot(key: RootFolderKey): Promise<Person[]> {
  const all = await livePeople();
  return all.filter((p) => matchesRoot(p, key));
}

export async function peopleInFolder(folderId: string): Promise<Person[]> {
  const all = await livePeople();
  return all.filter((p) => p.folderIds.includes(folderId));
}

export async function listFolders(): Promise<Folder[]> {
  return db.folders.toArray();
}

export interface TreeNode {
  key: string; /* a RootFolderKey or a Folder id */
  name: string;
  isRoot: boolean;
  children: TreeNode[];
}

/* The whole navigable tree for the picker and any full-tree view: roots first, each with its
   custom sub-folders nested underneath, any depth. */
export function buildTree(mode: Mode, allFolders: Folder[]): TreeNode[] {
  function childrenOf(parentId: string): TreeNode[] {
    return allFolders
      .filter((f) => f.parentId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((f) => ({ key: f.id, name: f.name, isRoot: false, children: childrenOf(f.id) }));
  }
  return rootsForMode(mode).map((r) => ({ key: r.key, name: r.label, isRoot: true, children: childrenOf(r.key) }));
}

export function rootOf(nodeId: string, allFolders: Folder[]): RootFolderKey {
  let id = nodeId;
  while (!id.startsWith('root:')) {
    const f = allFolders.find((x) => x.id === id);
    if (!f) return 'root:others';
    id = f.parentId;
  }
  return id as RootFolderKey;
}

export function folderName(id: string, mode: Mode, allFolders: Folder[]): string {
  if (id.startsWith('root:')) return rootsForMode(mode).find((r) => r.key === id)?.label ?? id;
  return allFolders.find((f) => f.id === id)?.name ?? '(deleted folder)';
}

/* Synchronous versions for a screen that already holds the full people/folders lists live
   (via useLive) and just needs to slice them per node on every render. */
export function directChildren(nodeId: string, allFolders: Folder[]): Folder[] {
  return allFolders.filter((f) => f.parentId === nodeId).sort((a, b) => a.name.localeCompare(b.name));
}

export function directPeople(nodeId: string, allPeople: Person[]): Person[] {
  if (nodeId.startsWith('root:')) return allPeople.filter((p) => matchesRoot(p, nodeId as RootFolderKey));
  return allPeople.filter((p) => p.folderIds.includes(nodeId));
}

export function peopleInSubtree(nodeId: string, allFolders: Folder[], allPeople: Person[]): Person[] {
  if (nodeId.startsWith('root:')) return directPeople(nodeId, allPeople);
  const ids = new Set<string>();
  const stack = [nodeId];
  while (stack.length) {
    const id = stack.pop()!;
    ids.add(id);
    for (const f of allFolders) if (f.parentId === id) stack.push(f.id);
  }
  return allPeople.filter((p) => p.folderIds.some((id) => ids.has(id)));
}

export function countForNode(nodeId: string, allFolders: Folder[], allPeople: Person[]): number {
  return peopleInSubtree(nodeId, allFolders, allPeople).length;
}

export async function childFolders(parentId: string): Promise<Folder[]> {
  const all = await listFolders();
  return all.filter((f) => f.parentId === parentId).sort((a, b) => a.name.localeCompare(b.name));
}

/* Recursive count, like a folder's size in a file browser — includes everyone in its
   sub-folders too, not only direct members. */
export async function folderCount(folderId: string): Promise<number> {
  const [all, people] = await Promise.all([listFolders(), livePeople()]);
  const ids = new Set<string>();
  const stack = [folderId];
  while (stack.length) {
    const id = stack.pop()!;
    ids.add(id);
    for (const f of all) if (f.parentId === id) stack.push(f.id);
  }
  const members = new Set<string>();
  for (const p of people) if (p.folderIds.some((id) => ids.has(id))) members.add(p.id);
  return members.size;
}

export async function createFolder(name: string, parentId: string): Promise<string> {
  const id = newId();
  await db.folders.add({ id, name: name.trim() || 'Untitled folder', parentId, createdAt: Date.now() });
  return id;
}

export interface FolderDeleteSnapshot {
  folder: Folder;
  childIds: string[];
  memberIds: string[];
}

/* Deleting a folder never deletes anyone in it — its children move up to its own parent, and
   its direct members simply lose that one label. Undo-able: the caller shows a toast with the
   snapshot this returns. */
export async function deleteFolder(id: string): Promise<FolderDeleteSnapshot | undefined> {
  const folder = await db.folders.get(id);
  if (!folder) return undefined;
  const kids = await childFolders(id);
  await Promise.all(kids.map((k) => db.folders.update(k.id, { parentId: folder.parentId })));
  const members = await peopleInFolder(id);
  await Promise.all(
    members.map((p) => db.people.update(p.id, { folderIds: p.folderIds.filter((f) => f !== id) }))
  );
  await db.folders.delete(id);
  return { folder, childIds: kids.map((k) => k.id), memberIds: members.map((m) => m.id) };
}

export async function undoDeleteFolder(snap: FolderDeleteSnapshot): Promise<void> {
  await db.folders.add(snap.folder);
  await Promise.all(snap.childIds.map((id) => db.folders.update(id, { parentId: snap.folder.id })));
  for (const id of snap.memberIds) {
    const p = await db.people.get(id);
    if (p && !p.folderIds.includes(snap.folder.id)) await db.people.update(id, { folderIds: [...p.folderIds, snap.folder.id] });
  }
}

export interface FolderChange {
  personId: string;
  before: string[];
}

async function applyAndSnapshot(personIds: string[], fn: (folderIds: string[]) => string[]): Promise<FolderChange[]> {
  const snapshot: FolderChange[] = [];
  for (const id of personIds) {
    const p = await db.people.get(id);
    if (!p) continue;
    snapshot.push({ personId: id, before: p.folderIds });
    await db.people.update(id, { folderIds: fn(p.folderIds) });
  }
  return snapshot;
}

export async function addToFolder(personIds: string[], folderId: string): Promise<FolderChange[]> {
  return applyAndSnapshot(personIds, (ids) => (ids.includes(folderId) ? ids : [...ids, folderId]));
}

export async function removeFromFolder(personIds: string[], folderId: string): Promise<FolderChange[]> {
  return applyAndSnapshot(personIds, (ids) => ids.filter((f) => f !== folderId));
}

export async function moveToFolder(personIds: string[], fromFolderId: string, toFolderId: string): Promise<FolderChange[]> {
  return applyAndSnapshot(personIds, (ids) => [...ids.filter((f) => f !== fromFolderId), toFolderId]);
}

export async function undoFolderChange(snapshot: FolderChange[]): Promise<void> {
  await Promise.all(snapshot.map((s) => db.people.update(s.personId, { folderIds: s.before })));
}

/* Tri-state for a bulk "Add to…" tick: are all/some/none of the selected people already in
   this folder? */
export function folderTickState(people: Person[], folderId: string): 'all' | 'some' | 'none' {
  const inCount = people.filter((p) => p.folderIds.includes(folderId)).length;
  if (inCount === 0) return 'none';
  return inCount === people.length ? 'all' : 'some';
}
