import Dexie, { type Table } from 'dexie';
import type { FileRecord, Folder, InboxItem, Memo, Person, Settings } from './types';
import { seedFolders, seedInbox, seedMemos, seedPeople } from './seed';

/* Renamed from the first (rejected) design's "zugbaseDB": that build only ever held made-up
   seed data, never a real backup, so there is nothing worth migrating — a clean database avoids
   crashing on records shaped for the old schema (no folderIds, no cameFrom, ...). Once real
   PeerMatch imports land here, schema changes go through a proper Dexie .upgrade() instead. */
class ZugbaseDB extends Dexie {
  people!: Table<Person, string>;
  memos!: Table<Memo, string>;
  folders!: Table<Folder, string>;
  inbox!: Table<InboxItem, string>;
  files!: Table<FileRecord, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super('zugbaseDB_v2');
    this.version(1).stores({
      people: 'id, role, name, waitingForReply, deletedAt, nextStepDue, suggestedToMe, *folderIds',
      memos: 'id, createdAt',
      folders: 'id, parentId',
      inbox: 'id, createdAt',
      files: 'id, personId',
      settings: 'key'
    });
  }
}

export const db = new ZugbaseDB();

export async function ensureSeeded(): Promise<void> {
  const count = await db.people.count();
  if (count === 0) {
    await db.people.bulkAdd(seedPeople());
    await db.folders.bulkAdd(seedFolders());
    await db.memos.bulkAdd(seedMemos());
    await db.inbox.bulkAdd(seedInbox());
  }
  const settings = await db.settings.get('app');
  if (!settings) await db.settings.put({ key: 'app', mode: 'shadchan', iAm: 'guy', waitDays: 30 });
}

/* Non-negotiable: deleted people stay recoverable for 30 days, then are purged for good along
   with any files only they used. Runs once per app start. */
export async function purgeOldDeleted(): Promise<void> {
  const settings = await db.settings.get('app');
  const days = settings?.waitDays ?? 30;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const toPurge = await db.people.filter((p) => !!p.deletedAt && p.deletedAt < cutoff).toArray();
  for (const p of toPurge) {
    await db.files.where('personId').equals(p.id).delete();
    await db.people.delete(p.id);
  }
}
