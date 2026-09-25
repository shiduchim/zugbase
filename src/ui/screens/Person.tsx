import { useState } from 'preact/hooks';
import type { Person } from '../../types';
import { useLive } from '../../hooks';
import { getPerson, patch, addActivity } from '../../repo';
import { currentAge } from '../../lib/age';
import { canSms, canWhatsApp, formatLocal, mailHref, smsHref, telHref, whatsappHref } from '../../lib/phone';
import { closeTop, mode, openEdit, openPerson } from '../../state';
import { db } from '../../db';
import { folderName } from '../../folders';
import { BackIcon, MicIcon, SendIcon } from '../parts/Icons';
import { Sheet, Pill } from '../parts/common';
import { FolderPicker } from '../parts/FolderPicker';

function boldAndLinks(text: string) {
  const parts = text.split(/(\*[^*]+\*|(?:\+?972|0)[\d\s-]{7,12}\d)/g);
  return parts.map((part, i) => {
    if (/^\*[^*]+\*$/.test(part)) return <b key={i}>{part.slice(1, -1)}</b>;
    if (/^(?:\+?972|0)[\d\s-]{7,12}\d$/.test(part))
      return (
        <a key={i} href={telHref(part)}>
          {part}
        </a>
      );
    return part;
  });
}

function ContactMini(props: { label: string; name?: string; phone?: string }) {
  if (!props.name && !props.phone) return null;
  return (
    <div class="contact-line">
      <div class="who">{props.label}</div>
      {props.name && <div class="cname">{props.name}</div>}
      {props.phone ? (
        <>
          <div class="cphone">{formatLocal(props.phone)}</div>
          <div class="mini-btns">
            <button onClick={() => (location.href = telHref(props.phone!))}>Call</button>
            {canSms(props.phone) && <button onClick={() => (location.href = smsHref(props.phone!))}>SMS</button>}
            {canWhatsApp(props.phone) && (
              <button onClick={() => (location.href = whatsappHref(props.phone!))}>WhatsApp</button>
            )}
          </div>
        </>
      ) : (
        <div class="sub" style="font-style: italic">
          No phone number
        </div>
      )}
    </div>
  );
}

type SubTab = 'profile' | 'details' | 'history';

function ProfileTab(props: { p: Person }) {
  const { p } = props;
  const mainPhone = p.role === 'shadchan' ? p.phone : p.contact1Phone || p.profilePhone;
  const age = currentAge(p.age);
  const lastCallNote = p.activities.find((a) => a.type === 'action' && a.text.startsWith('Call'));

  async function toggleWaiting() {
    await patch(p.id, (rec) => {
      rec.waitingForReply = !rec.waitingForReply;
      rec.waitingForReplySince = rec.waitingForReply ? Date.now() : undefined;
    });
  }

  return (
    <>
      {lastCallNote && (
        <div class="section">
          <div class="call-status">Last call status • {formatLocal(mainPhone ?? '')}</div>
        </div>
      )}
      {age !== undefined && (
        <div class="section">
          <Pill label={`Age ${age}`} />
        </div>
      )}
      <div class="section contact-row">
        {mainPhone && <a href={telHref(mainPhone)}>Call</a>}
        {p.email && <a href={mailHref(p.email)}>Email</a>}
        {mainPhone && canWhatsApp(mainPhone) && <a href={whatsappHref(mainPhone)}>WhatsApp</a>}
        {mainPhone && canSms(mainPhone) && <a href={smsHref(mainPhone)}>SMS</a>}
        <button class={`waiting-toggle ${p.waitingForReply ? 'on' : ''}`} onClick={toggleWaiting}>
          Waiting for reply
        </button>
      </div>
      {p.text && (
        <div class="section">
          <div class="card profile-card">{boldAndLinks(p.text)}</div>
        </div>
      )}
      {p.lookingFor && (
        <div class="section looking-for">
          Looking for: {p.lookingFor}
          {p.lookingForMaxAge && ` · up to age ${p.lookingForMaxAge}`}
        </div>
      )}
      {p.role !== 'shadchan' && (
        <div class="section card">
          <div class="contacts-card">
            <div class="contact-title">Contacts</div>
            <ContactMini label="Profile" phone={p.profilePhone} />
            <ContactMini label="Contact 1" name={p.contact1Name} phone={p.contact1Phone} />
            <ContactMini label="Contact 2" name={p.contact2Name} phone={p.contact2Phone} />
          </div>
        </div>
      )}
      {p.role !== 'shadchan' && (
        <div class="section">
          <button class="linked-shadchan-btn">{p.linkedShadchanId ? 'Linked Shadchan set' : 'Add linked Shadchan…'}</button>
        </div>
      )}
    </>
  );
}

function DetailsTab(props: { p: Person }) {
  const { p } = props;
  const allFolders = useLive(() => db.folders.toArray(), [], []);
  const [picking, setPicking] = useState(false);
  const cameFromPerson = useLive(() => (p.cameFrom?.personId ? db.people.get(p.cameFrom.personId) : Promise.resolve(undefined)), [p.cameFrom?.personId], undefined);

  function set<K extends keyof Person>(key: K, value: Person[K]) {
    patch(p.id, (rec) => {
      (rec[key] as Person[K]) = value;
    });
  }

  return (
    <>
      <div class="section card">
        <div class="flags">
          {p.role !== 'shadchan' && (
            <>
              <label>
                <input type="checkbox" checked={!!p.divorced} onChange={(e) => set('divorced', e.currentTarget.checked)} /> Divorced
              </label>
              <label>
                <input type="checkbox" checked={!!p.withKids} onChange={(e) => set('withKids', e.currentTarget.checked)} /> With kids
              </label>
              <label>
                <input type="checkbox" checked={!!p.kosherForKohen} onChange={(e) => set('kosherForKohen', e.currentTarget.checked)} /> Kosher for
                Kohen
              </label>
              <label>
                <input type="checkbox" checked={!!p.kohen} onChange={(e) => set('kohen', e.currentTarget.checked)} /> Kohen
              </label>
              <label>
                <input type="checkbox" checked={!!p.baalTeshuvah} onChange={(e) => set('baalTeshuvah', e.currentTarget.checked)} /> Baal
                teshuvah
              </label>
              <label>
                <input type="checkbox" checked={!!p.watchesMovies} onChange={(e) => set('watchesMovies', e.currentTarget.checked)} /> Watches
                movies
              </label>
              <label>
                <input type="checkbox" checked={!!p.prays3Daily} onChange={(e) => set('prays3Daily', e.currentTarget.checked)} /> Prays 3x
                daily
              </label>
              <label>
                <input type="checkbox" checked={!!p.smokes} onChange={(e) => set('smokes', e.currentTarget.checked)} /> Smokes
              </label>
            </>
          )}
          <label>
            <input type="checkbox" checked={!!p.talkedPhone} onChange={(e) => set('talkedPhone', e.currentTarget.checked)} /> Talked by phone
          </label>
          <label>
            <input type="checkbox" checked={!!p.talkedInPerson} onChange={(e) => set('talkedInPerson', e.currentTarget.checked)} /> Talked in
            person
          </label>
        </div>
        <div class="text-row">
          <div class="field-label">Tags</div>
          <input value={p.tags ?? ''} onInput={(e) => set('tags', e.currentTarget.value)} />
        </div>
        <div class="text-row">
          <div class="field-label">Religious level</div>
          <input value={p.religiousLevel ?? ''} onInput={(e) => set('religiousLevel', e.currentTarget.value)} />
        </div>
      </div>

      {p.role !== 'shadchan' && (
        <div class="section card">
          <div class="field-label" style="margin-bottom:6px">
            How well do I know them
          </div>
          <div class="radio-row">
            {(['personal', 'recommended', 'details'] as const).map((v) => (
              <button key={v} class={p.howWellKnown === v ? 'active' : ''} onClick={() => set('howWellKnown', v)}>
                {v === 'personal' ? 'Personally' : v === 'recommended' ? 'Recommended' : 'Only details'}
              </button>
            ))}
          </div>
          <label style="display:flex;align-items:center;gap:8px;margin-top:10px;font-size:13px">
            <input type="checkbox" checked={!!p.suggestedToMe} onChange={(e) => set('suggestedToMe', e.currentTarget.checked)} /> Suggested
            to me
          </label>
        </div>
      )}

      <div class="section card">
        <div class="field-label" style="margin-bottom:6px">
          Who sent it
        </div>
        <div class="sub" style="font-size:13px">
          {cameFromPerson ? (
            <span class="link-btn" style="display:inline;padding:0" onClick={() => openPerson(cameFromPerson.id)}>
              {cameFromPerson.name}
            </span>
          ) : (
            p.cameFrom?.name || '—'
          )}
        </div>
      </div>

      <div class="section card">
        <div class="field-label" style="margin-bottom:6px">
          Folders
        </div>
        <div class="pills" style="padding:0">
          {p.folderIds.length === 0 && <span class="sub">Not in any custom folder</span>}
          {p.folderIds.map((id) => (
            <span key={id} class="pill">
              {folderName(id, mode.value, allFolders)}
            </span>
          ))}
        </div>
        <button class="link-btn" onClick={() => setPicking(true)}>
          Add to…
        </button>
      </div>
      {picking && <FolderPicker personIds={[p.id]} onClose={() => setPicking(false)} />}
    </>
  );
}

function HistoryTab(props: { p: Person }) {
  const { p } = props;
  const [note, setNote] = useState('');

  async function send() {
    if (!note.trim()) return;
    await addActivity(p.id, note.trim());
    setNote('');
  }

  return (
    <>
      <div class="section history-band">
        <div class="h-title">History</div>
        {p.activities.length === 0 && <div class="sub">No history yet</div>}
        {p.activities.map((a) => (
          <div key={a.id} class={`history-entry ${a.type === 'action' && a.text.includes('sent') ? 'outgoing' : ''}`}>
            <div class="h-top">
              <span />
              <span class="h-time">{new Date(a.ts).toLocaleDateString()}</span>
              <button
                class="h-delete"
                onClick={() =>
                  patch(p.id, (rec) => {
                    rec.activities = rec.activities.filter((x) => x.id !== a.id);
                  })
                }
              >
                Delete
              </button>
            </div>
            {a.to && <div class="h-to">To: {a.to}</div>}
            <div class="h-text">{a.text}</div>
          </div>
        ))}
      </div>
      {p.createdAt && <div class="added-date">Added to zugbase: {new Date(p.createdAt).toLocaleDateString()}</div>}
      <div class="composer">
        <input placeholder="Note…" value={note} onInput={(e) => setNote(e.currentTarget.value)} />
        <button class="mic-btn" onClick={send}>
          {note.trim() ? <SendIcon /> : <MicIcon />}
        </button>
      </div>
    </>
  );
}

export function PersonScreen(props: { id: string }) {
  const p = useLive(() => getPerson(props.id), [props.id], undefined as Person | undefined);
  const [subtab, setSubtab] = useState<SubTab>('profile');
  if (!p) return null;

  return (
    <Sheet full>
      <div class="person-header">
        <button class="back-btn" onClick={closeTop}>
          <BackIcon />
        </button>
        <div class="name">{p.name || '(no name)'}</div>
        {p.role !== 'girl' && p.role !== 'shadchan' && <div class="photo-tile">Photo</div>}
        <div class="side">
          <div class="beis-hashem">ב״ה</div>
          <div class="edit-row">
            {p.role === 'girl' && <button class="photo-btn">Photo</button>}
            <button class="edit-btn" onClick={() => openEdit(p.role, p.id)}>
              Edit
            </button>
          </div>
        </div>
      </div>

      <div class="tabs-row">
        <button class={subtab === 'profile' ? 'active' : ''} onClick={() => setSubtab('profile')}>
          Profile
        </button>
        <button class={subtab === 'details' ? 'active' : ''} onClick={() => setSubtab('details')}>
          Details
        </button>
        <button class={subtab === 'history' ? 'active' : ''} onClick={() => setSubtab('history')}>
          History ({p.activities.length})
        </button>
      </div>

      {subtab === 'profile' && <ProfileTab p={p} />}
      {subtab === 'details' && <DetailsTab p={p} />}
      {subtab === 'history' && <HistoryTab p={p} />}
    </Sheet>
  );
}
