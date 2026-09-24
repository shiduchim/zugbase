import type { ComponentChildren } from 'preact';
import { closeTop } from '../../state';

export function Sheet(props: { children: ComponentChildren; full?: boolean }) {
  return (
    <div class="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && closeTop()}>
      <div class={`sheet ${props.full ? 'sheet-full' : ''}`}>{props.children}</div>
    </div>
  );
}

export function Pill(props: { label: string; on?: boolean; onClick?: () => void }) {
  return (
    <button type="button" class={`pill ${props.on ? 'pill-on' : ''}`} onClick={props.onClick}>
      {props.label}
    </button>
  );
}
