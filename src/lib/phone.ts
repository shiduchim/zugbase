/* Israeli local <-> international numbers. Landlines have no SMS/WhatsApp (kosher-phone rule). */

function digitsOnly(s: string): string {
  return s.replace(/\D/g, '');
}

/* Accepts +972 / 00972 / 972 / local 0… and returns the local 0… form. */
export function toLocal(raw: string): string {
  let d = digitsOnly(raw);
  if (d.startsWith('00972')) d = d.slice(5);
  else if (d.startsWith('972')) d = d.slice(3);
  if (d && !d.startsWith('0') && d.length <= 9) d = '0' + d;
  return d;
}

export function toWhatsAppNumber(raw: string): string {
  const local = toLocal(raw);
  return local.startsWith('0') ? '972' + local.slice(1) : digitsOnly(raw);
}

export function formatLocal(raw: string): string {
  const d = toLocal(raw);
  if (d.length === 10 && d.startsWith('05')) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
  return raw;
}

const LANDLINE_PREFIXES = ['02', '03', '04', '08', '09'];

export function isLandline(raw: string): boolean {
  const d = toLocal(raw);
  return LANDLINE_PREFIXES.some((p) => d.startsWith(p));
}

export function canSms(raw: string): boolean {
  return !!raw && !isLandline(raw);
}

export function canWhatsApp(raw: string): boolean {
  return !!raw && !isLandline(raw);
}

export function phoneKey(raw: string): string {
  const d = toLocal(raw);
  return d.startsWith('0') ? d.slice(1) : d;
}

export function telHref(raw: string): string {
  return `tel:${digitsOnly(raw)}`;
}

export function smsHref(raw: string, body?: string): string {
  return `sms:${digitsOnly(raw)}${body ? `?body=${encodeURIComponent(body)}` : ''}`;
}

export function mailHref(email: string, subject?: string): string {
  return `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
}

export function whatsappHref(raw: string, text?: string): string {
  const num = toWhatsAppNumber(raw);
  const q = text ? `&text=${encodeURIComponent(text)}` : '';
  return `whatsapp://send?phone=${num}${q}`;
}
