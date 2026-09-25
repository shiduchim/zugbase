import { useMemo, useState } from 'preact/hooks';
import { useLive } from '../../hooks';
import { searchAll, addActivity } from '../../repo';
import type { Person } from '../../types';
import { currentAge } from '../../lib/age';
import { mailHref, smsHref, telHref, whatsappHref } from '../../lib/phone';
import { newId } from '../../lib/ids';
import { closeTop } from '../../state';
import { Sheet } from '../parts/common';
import { BackIcon } from '../parts/Icons';

function PersonPicker(props: { label: string; onPick: (p: Person) => void; picked?: Person }) {
  const [q, setQ] = useState('');
  const results = useLive(() => searchAll(q), [q], [] as Person[]);
  if (props.picked) {
    return (
      <div class="text-row" style="grid-template-columns:92px 1fr">
        <div class="field-label">{props.label}</div>
        <div style="display:flex;gap:8px;align-items:center">
          <b>{props.picked.name}</b>
          <button class="link-btn" onClick={() => props.onPick(undefined as unknown as Person)}>
            Change
          </button>
        </div>
      </div>
    );
  }
  return (
    <div style="margin-bottom:10px">
      <label class="field-label">{props.label}</label>
      <input class="search" placeholder="Search…" value={q} onInput={(e) => setQ(e.currentTarget.value)} />
      {results.map((p) => (
        <div key={p.id} class="home-row" onClick={() => props.onPick(p)}>
          <span>{p.name}</span>
          <span class="when">{p.role}</span>
        </div>
      ))}
    </div>
  );
}

export function MakeMatch() {
  const [guy, setGuy] = useState<Person>();
  const [girl, setGirl] = useState<Person>();
  const [shadchan, setShadchan] = useState<Person>();
  const [langs, setLangs] = useState({ en: true, he: false, ru: false });
  const [sent, setSent] = useState('');

  const message = useMemo(() => {
    if (!guy || !girl) return '';
    const guyAge = currentAge(guy.age);
    const girlAge = currentAge(girl.age);
    return [
      'Shidduch suggestion',
      `Guy: ${guy.name}`,
      `Girl: ${girl.name}`,
      '',
      '--------------------',
      `GUY — ${guy.name} (age ${guyAge ?? '?'})`,
      guy.text,
      '--------------------',
      `GIRL — ${girl.name} (age ${girlAge ?? '?'})`,
      girl.text
    ].join('\n');
  }, [guy, girl, langs]);

  async function send(channel: 'contact' | 'sms' | 'whatsapp' | 'email') {
    if (!guy || !girl) return;
    const recipient = shadchan
      ? { name: shadchan.name, phone: shadchan.phone }
      : girl.contact1Name
        ? { name: girl.contact1Name, phone: girl.contact1Phone }
        : undefined;
    const phone = recipient?.phone ?? guy.contact1Phone;
    const matchId = newId();
    const label = `Match sent • ${channel}`;
    await Promise.all([
      addActivity(guy.id, label, recipient?.name ? `${recipient.name} • ${phone ?? ''}` : undefined),
      addActivity(girl.id, label, recipient?.name ? `${recipient.name} • ${phone ?? ''}` : undefined),
      shadchan ? addActivity(shadchan.id, label) : Promise.resolve()
    ]);
    if (phone) {
      if (channel === 'contact') location.href = telHref(phone);
      if (channel === 'sms') location.href = smsHref(phone, message);
      if (channel === 'whatsapp') location.href = whatsappHref(phone, message);
    }
    if (channel === 'email' && shadchan?.email) location.href = mailHref(shadchan.email, 'Shidduch suggestion');
    setSent(`Logged as ${label}${recipient?.name ? ` to ${recipient.name}` : ''} — matchId ${matchId.slice(0, 8)}`);
  }

  return (
    <Sheet full>
      <div class="person-header">
        <button class="back-btn" onClick={closeTop}>
          <BackIcon />
        </button>
        <div class="name">Make match</div>
      </div>

      <div class="section">
        <PersonPicker label="Guy" picked={guy} onPick={setGuy} />
        <PersonPicker label="Girl" picked={girl} onPick={setGirl} />
        <PersonPicker label="Shadchan (optional)" picked={shadchan} onPick={setShadchan} />
      </div>

      {guy && girl && (
        <>
          <div class="section card">
            <div class="flags" style="grid-template-columns:1fr 1fr 1fr">
              <label>
                <input type="checkbox" checked={langs.en} onChange={(e) => setLangs({ ...langs, en: e.currentTarget.checked })} /> English
              </label>
              <label>
                <input type="checkbox" checked={langs.he} onChange={(e) => setLangs({ ...langs, he: e.currentTarget.checked })} /> Hebrew
              </label>
              <label>
                <input type="checkbox" checked={langs.ru} onChange={(e) => setLangs({ ...langs, ru: e.currentTarget.checked })} /> Russian
              </label>
            </div>
          </div>
          <div class="section">
            <div class="card profile-card" style="font-size:13px">
              {message}
            </div>
          </div>
          <div class="section contact-row">
            <button onClick={() => send('contact')}>Contact</button>
            <button onClick={() => send('sms')}>SMS</button>
            <button onClick={() => send('whatsapp')}>WhatsApp</button>
            <button onClick={() => send('email')}>Email</button>
          </div>
          {sent && <div class="section sub" style="color:var(--muted)">{sent}</div>}
        </>
      )}
    </Sheet>
  );
}
