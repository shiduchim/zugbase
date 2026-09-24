import Dexie, { type Table } from 'dexie';
import type { Memo, Person } from './types';
import { seedPeople } from './seed';

class ZugbaseDB extends Dexie {
  people!: Table<Person, string>;
  memos!: Table<Memo, string>;

  constructor() {
    super('zugbaseDB');
    this.version(1).stores({
      people: 'id, role, name, referredById, waitingForReply, deletedAt, nextStepDue',
      memos: 'id, createdAt'
    });
  }
}

export const db = new ZugbaseDB();

export async function ensureSeeded(): Promise<void> {
  const count = await db.people.count();
  if (count === 0) await db.people.bulkAdd(seedPeople());
}
