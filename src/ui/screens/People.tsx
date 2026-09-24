import { useMemo, useState } from 'preact/hooks';
import type { Person, Role } from '../../types';
import { useLive } from '../../hooks';
import { listByRole } from '../../repo';
import { currentAge } from '../../lib/age';
import { formatLocal } from '../../lib/phone';
import { openEdit, openPerson, zoom } from '../../state';
import { ChevronIcon } from '../parts/Icons';
import { Pill } from '../parts/common';

const TITLES: Record<Role, string> = { guy: 'Guys', girl: 'Girls', shadchan: 'Shadchanim' };

function lastActivity(p: Person): string {
  return p.activities[0]?.text ?? '';
}

function Card(props: { p: Person; selected: boolean; onToggle: () => void; indent?: boolean }) {
  const { p } = props;
  const age = currentAge(p.age);
  const phone = p.role === 'shadchan' ? p.phone : p.profilePhone;
  const details = zoom.value === 'details';
  return (
    <div class={`row ${p.waitingForReply ? 'waiting' : ''} ${details ? '' : 'names'}`}>
      <input type="checkbox" class="checkbox" checked={props.selected} onChange={props.onToggle} />
      <div class="info" onClick={() => openPerson(p.id)}>
        <div class="name">{p.name || '(no name)'}</div>
        {details && (
          <>
            <div class="meta">
              {age !== undefined && <Pill label={`Age ${age}`} />}
              {p.contact1Name && <Pill label={`From ${p.contact1Name}`} />}
            </div>
            {phone && <div class="sub">{formatLocal(phone)}</div>}
            {lastActivity(p) && <div class="sub">{lastActivity(p)}</div>}
          </>
        )}
      </div>
      <div class="chevron" onClick={() => openPerson(p.id)}>
        <ChevronIcon />
      </div>
    </div>
  );
}

export function People(props: { role: Role }) {
  const people = useLive(() => listByRole(props.role), [props.role], [] as Person[]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter((p) =>
      [p.name, p.text, p.profilePhone, p.phone, p.tags].filter(Boolean).some((f) => f!.toLowerCase().includes(q))
    );
  }, [people, query]);

  const waitingCount = people.filter((p) => p.waitingForReply).length;

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const top = filtered.filter((p) => props.role !== 'shadchan' || !p.referredById);
  const childrenOf = (id: string) => filtered.filter((p) => p.referredById === id);

  return (
    <div class="screen">
      <div class="title-row">
        <h1>{TITLES[props.role]}</h1>
        <div class="pills">
          <Pill label={`Waiting for reply ${waitingCount}`} on={waitingCount > 0} />
        </div>
      </div>
      <div class="toolbar">
        <input class="search" placeholder="Search" value={query} onInput={(e) => setQuery(e.currentTarget.value)} />
        <div class="zoom">
          <button class={zoom.value === 'names' ? 'active' : ''} onClick={() => (zoom.value = 'names')}>
            −
          </button>
          <button class={zoom.value === 'details' ? 'active' : ''} onClick={() => (zoom.value = 'details')}>
            +
          </button>
        </div>
        <button class="btn-add" onClick={() => openEdit(props.role)}>
          Add
        </button>
      </div>

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
            <button onClick={() => setSelected(new Set(filtered.map((p) => p.id)))}>Select all</button>
            <button class="danger">Delete</button>
            <button onClick={() => setSelected(new Set())}>Clear</button>
          </div>
        </div>
      )}

      <div class="rows">
        {top.map((p) => {
          const kids = props.role === 'shadchan' ? childrenOf(p.id) : [];
          return (
            <div key={p.id}>
              <Card p={p} selected={selected.has(p.id)} onToggle={() => toggle(p.id)} />
              {kids.length > 0 && (
                <>
                  <div class="referral-strip">▾ {kids.length} referred shadchanim</div>
                  <div class="referral-children">
                    {kids.map((k) => (
                      <Card key={k.id} p={k} selected={selected.has(k.id)} onToggle={() => toggle(k.id)} indent />
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
