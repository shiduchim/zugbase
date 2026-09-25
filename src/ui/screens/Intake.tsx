import { useState } from 'preact/hooks';
import { useLive } from '../../hooks';
import { addInboxItem, getSettings, listInbox, removeInboxItem, createPerson } from '../../repo';
import { guessFromText } from '../../lib/guess';
import type { InboxItem, Role } from '../../types';
import { openPerson } from '../../state';

type What = 'idea' | 'single' | 'shadchan' | null;

function FileItem(props: { item: InboxItem }) {
  const [what, setWhat] = useState<What>(null);

  async function file(role: Role, suggestedToMe: boolean) {
    const guess = guessFromText(props.item.text);
    const id = await createPerson(role, {
      text: props.item.text,
      name: guess.name ?? '',
      age: guess.age ? { value: guess.age, asOf: Date.now() } : undefined,
      cameFrom: guess.contact ? { name: guess.contact.name, phone: guess.contact.phone } : undefined,
      contact1Name: guess.contact?.name,
      contact1Phone: guess.contact?.phone,
      suggestedToMe
    });
    await removeInboxItem(props.item.id);
    openPerson(id);
  }

  async function chooseWhat(w: What) {
    setWhat(w);
    if (w === 'shadchan') await file('shadchan', false);
    if (w === 'idea') {
      const settings = await getSettings();
      await file(settings.iAm === 'guy' ? 'girl' : 'guy', true);
    }
  }

  return (
    <div class="inbox-item">
      <div class="i-time">{new Date(props.item.createdAt).toLocaleString()}</div>
      <div>{props.item.text}</div>
      {what !== 'single' ? (
        <div class="i-actions">
          <button onClick={() => chooseWhat('idea')}>Idea for me</button>
          <button onClick={() => chooseWhat('single')}>A single</button>
          <button onClick={() => chooseWhat('shadchan')}>A shadchan</button>
        </div>
      ) : (
        <div class="i-actions">
          <button onClick={() => file('guy', false)}>Guy</button>
          <button onClick={() => file('girl', false)}>Girl</button>
        </div>
      )}
      <button class="link-btn" style="color:var(--danger)" onClick={() => removeInboxItem(props.item.id)}>
        Discard
      </button>
    </div>
  );
}

export function Intake() {
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
    <div class="screen">
      <h1 class="page-title">Intake folder</h1>
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
