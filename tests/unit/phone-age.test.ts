import { describe, expect, it } from 'vitest';
import { canSms, formatLocal, isLandline, phoneKey, toLocal, toWhatsAppNumber } from '../../src/lib/phone';
import { currentAge } from '../../src/lib/age';

describe('phone', () => {
  it('normalizes +972 / 00972 / 972 to local 0…', () => {
    expect(toLocal('+972-50-000-0101')).toBe('0500000101');
    expect(toLocal('00972500000101')).toBe('0500000101');
    expect(toLocal('972500000101')).toBe('0500000101');
    expect(toLocal('050-000-0101')).toBe('0500000101');
  });

  it('formats mobiles and landlines', () => {
    expect(formatLocal('0500000101')).toBe('050-000-0101');
    expect(formatLocal('020000099')).toBe('02-000-0099');
  });

  it('flags landlines as SMS-less', () => {
    expect(isLandline('02-000-0099')).toBe(true);
    expect(isLandline('050-000-0101')).toBe(false);
    expect(canSms('02-000-0099')).toBe(false);
    expect(canSms('050-000-0101')).toBe(true);
  });

  it('builds the WhatsApp international number', () => {
    expect(toWhatsAppNumber('050-000-0101')).toBe('972500000101');
  });

  it('keys phones for duplicate matching regardless of format', () => {
    expect(phoneKey('050-000-0101')).toBe(phoneKey('+972500000101'));
  });
});

describe('age', () => {
  it('counts forward from the date it was entered, never invented', () => {
    const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;
    const asOf = Date.now() - YEAR_MS - 1000;
    expect(currentAge({ value: 30, asOf })).toBe(31);
    expect(currentAge(undefined)).toBeUndefined();
  });
});
