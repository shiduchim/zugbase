/* SYNTHETIC data only — made-up names, phones with "000", emails at example.com. */
import type { Person } from './types';

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

export function seedPeople(): Person[] {
  return [
    {
      id: 's1',
      role: 'shadchan',
      name: 'Rivka Example',
      phone: '050-000-0101',
      email: 'rivka@example.com',
      text: 'Knows a lot of Chabad families in the north.',
      tags: 'Chabad',
      religiousLevel: 'Chabad',
      talkedPhone: true,
      activities: [{ id: 'a1', type: 'text', text: 'Spoke about new girls this week', ts: now - 2 * day }],
      createdAt: now - 60 * day
    },
    {
      id: 's2',
      role: 'shadchan',
      name: 'Dovid Sample',
      phone: '052-000-0202',
      text: '',
      referredById: 's1',
      activities: [],
      createdAt: now - 20 * day
    },
    {
      id: 'g1',
      role: 'guy',
      name: 'Moshe Example',
      age: { value: 26, asOf: now - 40 * day },
      text: 'Moshe Example\n26 • Never married\nLearning in the mornings, works in tech in the afternoons. Warm, easygoing, close with his family.',
      profilePhone: '053-000-0303',
      contact1Name: 'Rivka Example',
      contact1Phone: '050-000-0101',
      lookingFor: 'Kind, family oriented, willing to build a Torah home together',
      lookingForMaxAge: '25',
      tags: 'Chabad, learns daily',
      religiousLevel: 'Chabad',
      langEnglish: true,
      langHebrew: true,
      bodyType: 'regular',
      waitingForReply: true,
      waitingForReplySince: now - 3 * day,
      linkedShadchanId: 's1',
      activities: [
        { id: 'a2', type: 'text', text: 'Sent to Rivka for feedback', ts: now - 3 * day },
        { id: 'a3', type: 'action', text: 'Profile shared • WhatsApp', ts: now - 3 * day, to: 'Rivka Example • 050-000-0101' }
      ],
      createdAt: now - 40 * day
    },
    {
      id: 'g2',
      role: 'guy',
      name: 'Yaakov Sample',
      age: { value: 29, asOf: now - 200 * day },
      text: 'Yaakov Sample\n29\nBaal teshuvah, works as an accountant, plays guitar on Motzei Shabbos.',
      profilePhone: '054-000-0404',
      baalTeshuvah: true,
      watchesMovies: true,
      bodyType: 'regular',
      activities: [],
      createdAt: now - 200 * day
    },
    {
      id: 'girl1',
      role: 'girl',
      name: 'Chaya Example',
      age: { value: 24, asOf: now - 10 * day },
      text: 'Chaya Example\n24, Jerusalem\nTeaches kindergarten, loves hosting Shabbos guests.',
      profilePhone: '055-000-0505',
      contact2Name: 'Dovid Sample',
      contact2Phone: '052-000-0202',
      tags: 'Chabad, Jerusalem',
      religiousLevel: 'Chabad',
      langHebrew: true,
      langRussian: true,
      activities: [],
      createdAt: now - 10 * day
    },
    {
      id: 'girl2',
      role: 'girl',
      name: 'Leah Sample',
      age: { value: 22, asOf: now - 1 * day },
      text: 'Leah Sample\n22\nStudies occupational therapy, very close with her siblings.',
      profilePhone: '050-000-0606',
      waitingForReply: false,
      kosherForKohen: false,
      activities: [],
      createdAt: now - 1 * day
    },
    {
      id: 'girl3',
      role: 'girl',
      name: 'Miriam Example',
      age: { value: 27, asOf: now - 90 * day },
      text: 'Miriam Example\n27\nWorks in graphic design, previously suggested once, timing wasn’t right.',
      profilePhone: '052-000-0707',
      linkedShadchanId: 's2',
      waitingForReply: true,
      waitingForReplySince: now - 12 * day,
      activities: [{ id: 'a4', type: 'action', text: 'Reply received', ts: now - 12 * day }],
      createdAt: now - 90 * day
    }
  ];
}
