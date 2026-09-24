import { useEffect, useState } from 'preact/hooks';
import type { Person, Role } from '../../types';
import { createPerson, getPerson, patch } from '../../repo';
import { guessFromText } from '../../lib/guess';
import { closeTop, openPerson } from '../../state';
import { Sheet } from '../parts/common';

type Draft = Partial<Person>;

export function PersonEdit(props: { role: Role; id?: string }) {
  const [draft, setDraft] = useState<Draft>({});
  const [showEmail, setShowEmail] = useState(false);
  const [ready, setReady] = useState(!props.id);

  useEffect(() => {
    if (!props.id) return;
    getPerson(props.id).then((p) => {
      setDraft(p ?? {});
      setShowEmail(!!p?.email);
      setReady(true);
    });
  }, [props.id]);

  function set<K extends keyof Person>(key: K, value: Person[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function pasteProfile() {
    navigator.clipboard.readText().then((text) => {
      if (!text) return;
      const guess = guessFromText(text);
      setDraft((d) => ({
        ...d,
        text: d.text || text,
        name: d.name || guess.name,
        age: d.age || (guess.age ? { value: guess.age, asOf: Date.now() } : d.age),
        contact1Name: d.contact1Name || guess.contact?.name,
        contact1Phone: d.contact1Phone || guess.contact?.phone
      }));
    });
  }

  async function save() {
    const name = draft.name?.trim() || draft.text?.split('\n')[0]?.trim() || '';
    if (props.id) {
      await patch(props.id, (p) => Object.assign(p, draft, { name }));
      openPersonAfterSave(props.id);
    } else {
      const id = await createPerson(props.role, { ...draft, name });
      openPersonAfterSave(id);
    }
  }

  function openPersonAfterSave(id: string) {
    closeTop();
    setTimeout(() => openPerson(id), 0);
  }

  if (!ready) return null;
  const isShadchan = props.role === 'shadchan';

  return (
    <Sheet full>
      <div class="person-header">
        <div class="name">{props.id ? `Edit ${draft.name || ''}` : `Add ${props.role}`}</div>
      </div>

      <div class="form-section">
        {isShadchan ? (
          <>
            <label>Name</label>
            <input value={draft.name ?? ''} onInput={(e) => set('name', e.currentTarget.value)} />
            <div style="height:8px" />
            <label>Phone</label>
            <input value={draft.phone ?? ''} onInput={(e) => set('phone', e.currentTarget.value)} />
          </>
        ) : (
          <div class="form-row">
            <div>
              <label>Name</label>
              <input value={draft.name ?? ''} onInput={(e) => set('name', e.currentTarget.value)} />
            </div>
            <div>
              <label>Age</label>
              <input
                type="number"
                value={draft.age?.value ?? ''}
                onInput={(e) => set('age', { value: Number(e.currentTarget.value), asOf: draft.age?.asOf ?? Date.now() })}
              />
            </div>
          </div>
        )}
      </div>

      <div class="form-section">
        <button class="paste-btn" onClick={pasteProfile}>
          Paste profile
        </button>
        <label>{isShadchan ? 'Profile / notes' : 'Profile'}</label>
        <textarea rows={6} value={draft.text ?? ''} onInput={(e) => set('text', e.currentTarget.value)} />
      </div>

      {!isShadchan && (
        <div class="form-section">
          <label>Looking for</label>
          <textarea rows={2} value={draft.lookingFor ?? ''} onInput={(e) => set('lookingFor', e.currentTarget.value)} />
          <div style="height:8px" />
          <label>Up to age</label>
          <input value={draft.lookingForMaxAge ?? ''} onInput={(e) => set('lookingForMaxAge', e.currentTarget.value)} />
        </div>
      )}

      <div class="form-section">
        <label>{isShadchan ? '' : 'Contacts'}</label>
        {!isShadchan && (
          <>
            <div class="phone-line">
              <input placeholder="Profile phone" value={draft.profilePhone ?? ''} onInput={(e) => set('profilePhone', e.currentTarget.value)} />
            </div>
            <div class="phone-line">
              <input placeholder="Contact 1 name" value={draft.contact1Name ?? ''} onInput={(e) => set('contact1Name', e.currentTarget.value)} />
              <input placeholder="Phone" value={draft.contact1Phone ?? ''} onInput={(e) => set('contact1Phone', e.currentTarget.value)} />
              <button onClick={() => set('contact1Name', '')}>Remove</button>
            </div>
            <div class="phone-line">
              <input placeholder="Contact 2 name" value={draft.contact2Name ?? ''} onInput={(e) => set('contact2Name', e.currentTarget.value)} />
              <input placeholder="Phone" value={draft.contact2Phone ?? ''} onInput={(e) => set('contact2Phone', e.currentTarget.value)} />
              <button onClick={() => set('contact2Name', '')}>Remove</button>
            </div>
            <button class="link-btn">Add another phone</button>
          </>
        )}
        {showEmail || draft.email ? (
          <input placeholder="Email" value={draft.email ?? ''} onInput={(e) => set('email', e.currentTarget.value)} />
        ) : (
          <button class="link-btn" onClick={() => setShowEmail(true)}>
            Add email
          </button>
        )}
      </div>

      <div class="form-section">
        <label>Tags</label>
        <input value={draft.tags ?? ''} onInput={(e) => set('tags', e.currentTarget.value)} />
        <div style="height:8px" />
        <label>Religious level</label>
        <input value={draft.religiousLevel ?? ''} onInput={(e) => set('religiousLevel', e.currentTarget.value)} />
        <div style="height:8px" />
        <label>Religious details</label>
        <input value={draft.religiousDetails ?? ''} onInput={(e) => set('religiousDetails', e.currentTarget.value)} />
      </div>

      <div class="save-bar">
        <button class="save" onClick={save}>
          Save {props.role === 'guy' ? 'Guy' : props.role === 'girl' ? 'Girl' : 'Shadchan'}
        </button>
        <button class="cancel" onClick={closeTop}>
          Cancel
        </button>
      </div>
    </Sheet>
  );
}
