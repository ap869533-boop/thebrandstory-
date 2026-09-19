/** Shared validation helpers used by campaign, profile, and inquiry controllers. */

const URL_PATTERN = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

/** Accepts Indian mobiles and common international WhatsApp formats. */
export function validateWhatsAppNumber(raw: string | undefined | null): { ok: boolean; normalized: string; error?: string } {
  if (!raw || typeof raw !== 'string') {
    return { ok: false, normalized: '', error: 'WhatsApp / phone number is required' };
  }
  const trimmed = raw.trim();
  const digits = trimmed.replace(/[^\d]/g, '');
  if (digits.length < 10 || digits.length > 15) {
    return { ok: false, normalized: '', error: 'Enter a valid WhatsApp number (10–15 digits)' };
  }
  // India: optional 91 + 10-digit mobile starting 6–9
  if (digits.length === 10 && !/^[6-9]\d{9}$/.test(digits)) {
    return { ok: false, normalized: '', error: 'Enter a valid 10-digit Indian mobile number' };
  }
  if (digits.length === 12 && digits.startsWith('91') && !/^91[6-9]\d{9}$/.test(digits)) {
    return { ok: false, normalized: '', error: 'Enter a valid Indian WhatsApp number' };
  }
  return { ok: true, normalized: trimmed };
}

export function validateOptionalUrl(raw: string | undefined | null, fieldLabel: string): { ok: boolean; value: string | null; error?: string } {
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    return { ok: true, value: null };
  }
  const value = String(raw).trim();
  if (!URL_PATTERN.test(value)) {
    return { ok: false, value: null, error: `${fieldLabel} must be a valid http(s) URL` };
  }
  return { ok: true, value };
}

export function parseNonNegInt(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.floor(n);
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Magic-byte sniff for common image formats. */
export function detectImageMimeFromBuffer(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'image/gif';
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return 'image/webp';
  return null;
}

export const IMAGE_MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};
