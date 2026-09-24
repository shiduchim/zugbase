import { signal } from '@preact/signals';
import type { Role } from './types';

export type Tab = 'home' | 'shadchan' | 'guy' | 'girl';
export type Layer = { kind: 'person'; id: string } | { kind: 'edit'; role: Role; id?: string };

export const tab = signal<Tab>('home');
export const layers = signal<Layer[]>([]);
export const zoom = signal<'names' | 'details'>('details');

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

export function closeTop(): void {
  history.back();
}
