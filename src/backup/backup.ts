/* One real ZIP backup, plus the TXT/Base64 fallback for when a share sheet won't send a .zip.
   Own format for now (zugbase v1) — reading old PeerMatch backups is a follow-up, not yet done. */
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import { db } from '../db';
import { updateSettings } from '../repo';
import type { FileRecord } from '../types';

const FORMAT = 'zugbase';
const VERSION = 1;

interface FileMeta {
  id: string;
  personId: string;
  kind: FileRecord['kind'];
  name?: string;
  type?: string;
}

async function buildZipBytes(): Promise<Uint8Array> {
  const [people, folders, memos, inbox, settings, files] = await Promise.all([
    db.people.toArray(),
    db.folders.toArray(),
    db.memos.toArray(),
    db.inbox.toArray(),
    db.settings.toArray(),
    db.files.toArray()
  ]);

  const zipInput: Record<string, Uint8Array> = {};
  const fileMeta: FileMeta[] = [];
  for (const f of files) {
    zipInput[`files/${f.id}`] = new Uint8Array(await f.blob.arrayBuffer());
    fileMeta.push({ id: f.id, personId: f.personId, kind: f.kind, name: f.name, type: f.type });
  }

  const manifest = {
    format: FORMAT,
    version: VERSION,
    createdAt: Date.now(),
    tables: { people, folders, memos, inbox, settings },
    files: fileMeta
  };
  zipInput['data.json'] = strToU8(JSON.stringify(manifest));

  /* Stored uncompressed, same as PeerMatch's backups — faster, and photos/audio barely compress. */
  return zipSync(zipInput, { level: 0 });
}

function download(bytes: Uint8Array | string, filename: string, mime: string): void {
  const blob = new Blob([bytes as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function runBackup(): Promise<void> {
  const bytes = await buildZipBytes();
  download(bytes, `zugbase-backup-${dateStamp()}.zip`, 'application/zip');
  await updateSettings((s) => {
    s.lastBackupAt = Date.now();
  });
}

/* Encode in chunks whose size is a multiple of 3, so padding never lands mid-stream when the
   pieces are joined — the same fix PeerMatch needed for large backups. */
function bytesToBase64(bytes: Uint8Array): string {
  const CHUNK = 3 * 20_000;
  let out = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    out += btoa(String.fromCharCode(...bytes.subarray(i, i + CHUNK)));
  }
  return out;
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function runBackupAsTxt(): Promise<void> {
  const bytes = await buildZipBytes();
  const text = 'ZUGBASE-BACKUP-TEXT-V1\n' + bytesToBase64(bytes);
  download(text, `zugbase-backup-${dateStamp()}.txt`, 'text/plain');
  await updateSettings((s) => {
    s.lastBackupAt = Date.now();
  });
}

export interface RestoreCounts {
  people: number;
  folders: number;
  memos: number;
  inbox: number;
}

async function restoreFromZipBytes(bytes: Uint8Array): Promise<RestoreCounts> {
  const files = unzipSync(bytes);
  const manifestBytes = files['data.json'];
  if (!manifestBytes) throw new Error('Not a zugbase backup — no data.json inside the ZIP');
  const manifest = JSON.parse(strFromU8(manifestBytes));
  if (manifest.format !== FORMAT) throw new Error('Unrecognized backup format');

  await db.transaction('rw', [db.people, db.folders, db.memos, db.inbox, db.settings, db.files], async () => {
    await Promise.all([db.people.clear(), db.folders.clear(), db.memos.clear(), db.inbox.clear(), db.files.clear()]);
    await db.people.bulkAdd(manifest.tables.people);
    await db.folders.bulkAdd(manifest.tables.folders);
    await db.memos.bulkAdd(manifest.tables.memos);
    await db.inbox.bulkAdd(manifest.tables.inbox);
    if (manifest.tables.settings?.[0]) await db.settings.put(manifest.tables.settings[0]);

    for (const meta of manifest.files as FileMeta[]) {
      const bytes = files[`files/${meta.id}`];
      if (!bytes) continue;
      const blob = new Blob([bytes as BlobPart], { type: meta.type });
      await db.files.add({ id: meta.id, personId: meta.personId, kind: meta.kind, blob, name: meta.name, type: meta.type });
    }
  });

  return {
    people: manifest.tables.people.length,
    folders: manifest.tables.folders.length,
    memos: manifest.tables.memos.length,
    inbox: manifest.tables.inbox.length
  };
}

export async function restoreFromFile(file: File): Promise<RestoreCounts> {
  const buf = new Uint8Array(await file.arrayBuffer());
  if (file.name.toLowerCase().endsWith('.txt')) {
    const text = new TextDecoder().decode(buf);
    const b64 = text.split('\n').slice(1).join('');
    return restoreFromZipBytes(base64ToBytes(b64));
  }
  return restoreFromZipBytes(buf);
}
