/* Fills only-empty fields from pasted profile text (EN/HE/RU), same idea as PeerMatch's
   "Paste profile". Never overwrites a field that already has a value. */

const AGE_PATTERNS = [
  /\bage[:\s]+(\d{1,2})\b/i,
  /\b(\d{1,2})\s*(?:years?\s*old|y\.?o\.?)\b/i,
  /\bבן\s*(\d{1,2})\b/,
  /\bבת\s*(\d{1,2})\b/,
  /\bгид\s*(\d{1,2})\b/i,
  /\b(\d{1,2})\s*лет\b/i
];

const NAME_LINE = /^(?:name|שם|Имя)\s*[:\-]\s*(.+)$/im;

export interface GuessedContact {
  name?: string;
  phone?: string;
}

export interface Guess {
  name?: string;
  age?: number;
  contact?: GuessedContact;
}

const PHONE_RE = /(?:\+?972|0)[\s-]?(?:\d[\s-]?){8,9}/;
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

export function guessFromText(text: string): Guess {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const guess: Guess = {};

  const named = NAME_LINE.exec(text);
  guess.name = named?.[1]?.trim() || lines[0];

  for (const re of AGE_PATTERNS) {
    const m = re.exec(text);
    if (m?.[1]) {
      guess.age = Number(m[1]);
      break;
    }
  }

  const tail = lines.slice(-4).join('\n');
  const phone = PHONE_RE.exec(tail)?.[0];
  const email = EMAIL_RE.exec(tail)?.[0];
  if (phone || email) {
    const contactLine = lines.slice(-4).find((l) => (phone && l.includes(phone)) || (email && l.includes(email)));
    const name = contactLine?.replace(phone ?? '', '').replace(email ?? '', '').replace(/[:\-,]/g, '').trim();
    guess.contact = { name: name || undefined, phone: phone?.trim() };
  }

  return guess;
}
