import { useRef, useState } from 'preact/hooks';
import { useLive, usePhotoUrl } from '../../hooks';
import { addInboxItem, attachInboxPhoto, listInbox, removeInboxItem, createPerson } from '../../repo';
import { guessFromText } from '../../lib/guess';
import type { InboxItem, Role } from '../../types';
import { openPerson } from '../../state';

type What = 'idea' | 'single' | 'shadchan' | null;

function FileItem(props: { item: InboxItem }) {
  const [what, setWhat] = useState<What>(null);
  const photoUrl = usePhotoUrl(props.item.photoFileId);
  const photoInput = useRef<HTMLInputElement>(null);

  async function file(role: Role, suggestedToMe: boolean) {
    const guess = guessFromText(props.item.text);
    const id = await createPerson(role, {
      text: props.item.text,
      name: guess.name ?? '',
      age: guess.age ? { value: guess.age, asOf: Date.now() } : undefined,
      cameFrom: guess.contact ? { name: guess.contact.name, phone: guess.contact.phone } : undefined,
      contact1Name: guess.contact?.name,
      contact1Phone: guess.contact?.phone,
      photoFileId: props.item.photoFileId,
      suggestedToMe
    });
    await removeInboxItem(props.item.id);
    openPerson(id);
  }

  /* "Idea for me" and "A single" both need a real gender — guessing it from the "I am"
     setting instead of the actual text was the bug: a guy's profile silently filed as a girl.
     Both paths now ask Guy/Girl explicitly; "idea" just also sets suggestedToMe. */
  function chooseWhat(w: What) {
    setWhat(w);
    if (w === 'shadchan') file('shadchan', false);
  }

  return (
    <div class="inbox-item">
      <div class="i-time">{new Date(props.item.createdAt).toLocaleString()}</div>
      <div>{props.item.text}</div>
      <input
        ref={photoInput}
        type="file"
        accept="image/*"
        style="display:none"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (file) attachInboxPhoto(props.item.id, file);
        }}
      />
      {photoUrl ? (
        <img src={photoUrl} style="max-width:120px;border-radius:10px;display:block;margin-top:8px" />
      ) : (
        <button class="link-btn" onClick={() => photoInput.current?.click()}>
          + Attach photo
        </button>
      )}
      {what === null && (
        <div class="i-actions">
          <button onClick={() => chooseWhat('idea')}>Idea for me</button>
          <button onClick={() => chooseWhat('single')}>A single</button>
          <button onClick={() => chooseWhat('shadchan')}>A shadchan</button>
        </div>
      )}
      {(what === 'idea' || what === 'single') && (
        <div class="i-actions">
          <button onClick={() => file('guy', what === 'idea')}>Guy</button>
          <button onClick={() => file('girl', what === 'idea')}>Girl</button>
        </div>
      )}
      <button class="link-btn" style="color:var(--danger)" onClick={() => removeInboxItem(props.item.id)}>
        Discard
      </button>
    </div>
  );
}

export function IntakeList() {
  const items = useLive(listInbox, [], [] as InboxItem[]);

  async function paste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) await addInboxItem(text);
    } catch {
      alert('Could not read the clipboard — copy the text first, then tap Paste.');
    }
  }

  return (
    <div>
      <div class="toolbar">
        <button class="btn btn-primary" style="flex:1" onClick={paste}>
          Paste
        </button>
      </div>
      <div class="rows" style="gap:12px">
        {items.length === 0 && <div class="empty-state">Nothing waiting to be filed</div>}
        {items.map((i) => (
          <FileItem key={i.id} item={i} />
        ))}
      </div>
    </div>
  );
}
