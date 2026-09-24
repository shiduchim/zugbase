import { db } from './db';
import type { Memo, Person, Role } from './types';
import { newId } from './lib/ids';

export async function listByRole(role: Role): Promise<Person[]> {
  const all = await db.people.where('role').equals(role).toArray();
  return all.filter((p) => !p.deletedAt).sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

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
  const person: Person = { id, role, name: '', text: '', activities: [], createdAt: Date.now(), ...fields };
  await db.people.add(person);
  return id;
}

export async function softDelete(id: string): Promise<void> {
  await patch(id, (p) => {
    p.deletedAt = Date.now();
  });
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
