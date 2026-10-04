import { signal } from '@preact/signals';
import type { Mode, Role } from './types';
import { ZUGBASE_ROOT } from './types';

export type Tab = 'home' | 'browse';
export type Layer =
  | { kind: 'person'; id: string }
  | { kind: 'edit'; role: Role; id?: string }
  | { kind: 'settings' }
  | { kind: 'deleted' }
  | { kind: 'match' };

export const tab = signal<Tab>('home');
export const layers = signal<Layer[]>([]);
export const zoom = signal<'folders' | 'names' | 'details'>('details');
export const mode = signal<Mode>('shadchan');

/* Browse's current place in the folder tree: a stack of node ids, always starting at the one
   real root, ZUGBASE_ROOT — the whole app is one tree: zugbase > folder > sub-folder > ... */
export type BrowsePath = string[];
export const browsePath = signal<BrowsePath>([ZUGBASE_ROOT]);

export interface Toast {
  id: number;
  message: string;
  onUndo?: () => void;
}
export const toast = signal<Toast | undefined>(undefined);
let toastSeq = 0;
export function showToast(message: string, onUndo?: () => void): void {
  const id = ++toastSeq;
  toast.value = { id, message, onUndo };
  setTimeout(() => {
    if (toast.value?.id === id) toast.value = undefined;
  }, 5000);
}

/* Every sheet is its own history entry, so the phone's Back button closes the sheet and not
   the screen. Only this popstate handler removes a layer — the UI only pushes. */
window.addEventListener('popstate', () => {
  if (layers.value.length) layers.value = layers.value.slice(0, -1);
});

export function openPerson(id: string): void {
  history.pushState({ depth: layers.value.length + 1 }, '');
  layers.value = [...layers.value, { kind: 'person', id }];
}

export function openEdit(role: Role, id?: string): void {
  history.pushState({ depth: layers.value.length + 1 }, '');
  layers.value = [...layers.value, { kind: 'edit', role, id }];
}

export function openSettings(): void {
  history.pushState({ depth: layers.value.length + 1 }, '');
  layers.value = [...layers.value, { kind: 'settings' }];
}

export function openDeleted(): void {
  history.pushState({ depth: layers.value.length + 1 }, '');
  layers.value = [...layers.value, { kind: 'deleted' }];
}

export function openMatch(): void {
  history.pushState({ depth: layers.value.length + 1 }, '');
  layers.value = [...layers.value, { kind: 'match' }];
}

export function closeTop(): void {
  history.back();
}
