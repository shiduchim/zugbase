import { db } from './db';
import type { FileRecord, InboxItem, Memo, Person, Role, Settings } from './types';
import { newId } from './lib/ids';

export async function getPerson(id: string): Promise<Person | undefined> {
  return db.people.get(id);
}

/* Re-reads the stored record before every change, so a quick edit never saves over newer data. */
export async function patch(id: string, fn: (p: Person) => void): Promise<void> {
  const current = await db.people.get(id);
  if (!current) return;
  fn(current);
  await db.people.put(current);
}

export async function addActivity(id: string, text: string, to?: string): Promise<void> {
  await patch(id, (p) => {
    p.activities = [{ id: newId(), type: 'text', text, ts: Date.now(), to }, ...p.activities];
  });
}

export async function createPerson(role: Role, fields: Partial<Person>): Promise<string> {
  const id = newId();
  const person: Person = { id, role, name: '', text: '', folderIds: [], activities: [], createdAt: Date.now(), ...fields };
  await db.people.add(person);
  return id;
}

export async function softDelete(id: string): Promise<void> {
  await patch(id, (p) => {
    p.deletedAt = Date.now();
  });
}

export async function restorePerson(id: string): Promise<void> {
  await patch(id, (p) => {
    p.deletedAt = undefined;
  });
}

export async function listDeleted(): Promise<Person[]> {
  const all = await db.people.toArray();
  return all.filter((p) => !!p.deletedAt).sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));
}

export async function listRecentlyAdded(limit = 5): Promise<Person[]> {
  const all = await db.people.toArray();
  return all
    .filter((p) => !p.deletedAt)
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    .slice(0, limit);
}

export async function listCallsDue(): Promise<Person[]> {
  const all = await db.people.toArray();
  return all
    .filter((p) => !p.deletedAt && p.nextStepDue)
    .sort((a, b) => (a.nextStepDue ?? 0) - (b.nextStepDue ?? 0));
}

export async function setCallDue(id: string, due: number | undefined): Promise<void> {
  await patch(id, (p) => {
    p.nextStepDue = due;
  });
}

export async function searchAll(query: string): Promise<Person[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const all = await db.people.toArray();
  return all.filter((p) => !p.deletedAt && p.name.toLowerCase().includes(q)).slice(0, 8);
}

export async function listMemos(): Promise<Memo[]> {
  const all = await db.memos.toArray();
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function addMemo(text: string): Promise<void> {
  await db.memos.add({ id: newId(), text, createdAt: Date.now() });
}

export async function deleteMemo(id: string): Promise<void> {
  await db.memos.delete(id);
}

/* Settings */
export async function getSettings(): Promise<Settings> {
  const s = await db.settings.get('app');
  return s ?? { key: 'app', mode: 'shadchan', iAm: 'guy', waitDays: 30 };
}

export async function updateSettings(fn: (s: Settings) => void): Promise<void> {
  const current = await getSettings();
  fn(current);
  await db.settings.put(current);
}

/* Intake folder — raw pasted/shared text, kept exactly as it came until filed. */
export async function listInbox(): Promise<InboxItem[]> {
  const all = await db.inbox.toArray();
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function addInboxItem(text: string): Promise<string> {
  const id = newId();
  await db.inbox.add({ id, text, createdAt: Date.now() });
  return id;
}

export async function removeInboxItem(id: string): Promise<void> {
  await db.inbox.delete(id);
}

/* Files — photos, PDFs and audio, stored apart from the record so a quick edit stays fast. */
export async function saveFile(personId: string, kind: FileRecord['kind'], blob: Blob, name?: string, type?: string): Promise<string> {
  const id = newId();
  await db.files.add({ id, personId, kind, blob, name, type });
  return id;
}

export async function getFile(id: string): Promise<FileRecord | undefined> {
  return db.files.get(id);
}
