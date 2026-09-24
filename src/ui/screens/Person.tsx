import type { Person } from '../../types';
import { useLive } from '../../hooks';
import { getPerson, patch, addActivity } from '../../repo';
import { currentAge } from '../../lib/age';
import { canSms, canWhatsApp, formatLocal, mailHref, smsHref, telHref, whatsappHref } from '../../lib/phone';
import { closeTop, openEdit } from '../../state';
import { BackIcon, MicIcon, SendIcon } from '../parts/Icons';
import { Sheet, Pill } from '../parts/common';
import { useState } from 'preact/hooks';

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

export function PersonScreen(props: { id: string }) {
  const p = useLive(() => getPerson(props.id), [props.id], undefined as Person | undefined);
  const [note, setNote] = useState('');
  if (!p) return null;

  const mainPhone = p.role === 'shadchan' ? p.phone : p.contact1Phone || p.profilePhone;
  const age = currentAge(p.age);
  const lastCallNote = p.activities.find((a) => a.type === 'action' && a.text.startsWith('Call'));

  async function toggleWaiting() {
    await patch(p!.id, (rec) => {
      rec.waitingForReply = !rec.waitingForReply;
      rec.waitingForReplySince = rec.waitingForReply ? Date.now() : undefined;
    });
  }

  async function send() {
    if (!note.trim()) return;
    await addActivity(p!.id, note.trim());
    setNote('');
  }

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

      <div class="section card">
        <div class="flags">
          {p.role !== 'shadchan' && (
            <>
              <label>
                <input type="checkbox" checked={!!p.divorced} readOnly /> Divorced
              </label>
              <label>
                <input type="checkbox" checked={!!p.withKids} readOnly /> With kids
              </label>
              <label>
                <input type="checkbox" checked={!!p.kosherForKohen} readOnly /> Kosher for Kohen
              </label>
              <label>
                <input type="checkbox" checked={!!p.kohen} readOnly /> Kohen
              </label>
              <label>
                <input type="checkbox" checked={!!p.baalTeshuvah} readOnly /> Baal teshuvah
              </label>
              <label>
                <input type="checkbox" checked={!!p.watchesMovies} readOnly /> Watches movies
              </label>
              <label>
                <input type="checkbox" checked={!!p.prays3Daily} readOnly /> Prays 3x daily
              </label>
              <label>
                <input type="checkbox" checked={!!p.smokes} readOnly /> Smokes
              </label>
            </>
          )}
          <label>
            <input type="checkbox" checked={!!p.talkedPhone} readOnly /> Talked by phone
          </label>
          <label>
            <input type="checkbox" checked={!!p.talkedInPerson} readOnly /> Talked in person
          </label>
        </div>
        <div class="text-row">
          <div class="field-label">Tags</div>
          <input value={p.tags ?? ''} readOnly />
        </div>
        <div class="text-row">
          <div class="field-label">Religious level</div>
          <input value={p.religiousLevel ?? ''} readOnly />
        </div>
      </div>

      {p.role !== 'shadchan' && (
        <div class="section">
          <button class="linked-shadchan-btn">
            {p.linkedShadchanId ? 'Linked Shadchan set' : 'Add linked Shadchan…'}
          </button>
        </div>
      )}

      <div class="section history-band">
        <div class="h-title">History</div>
        {p.activities.length === 0 && <div class="sub">No history yet</div>}
        {p.activities.map((a) => (
          <div key={a.id} class={`history-entry ${a.type === 'action' && a.text.includes('sent') ? 'outgoing' : ''}`}>
            <div class="h-top">
              <span />
              <span class="h-time">{new Date(a.ts).toLocaleDateString()}</span>
              <button class="h-delete">Delete</button>
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
    </Sheet>
  );
}
