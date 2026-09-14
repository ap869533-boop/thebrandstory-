/**
 * Sanitizes an Instagram handle or profile URL to return only the clean username.
 * Examples:
 * - "https://instagram.com/destination_0o?stkn-mwi1mxeyenntmdnpcg--" -> "destination_0o"
 * - "@destination_0o" -> "destination_0o"
 * - "destination_0o?stkn=123" -> "destination_0o"
 * - "https://www.instagram.com/priyasharma/" -> "priyasharma"
 */
export function cleanInstagramHandle(input?: string): string {
  if (!input) return '';
  let str = input.trim();
  
  // Remove protocol
  str = str.replace(/^https?:\/\//i, '');
  // Remove domain
  str = str.replace(/^(?:www\.)?instagram\.com\//i, '');
  // Remove query params (?igsh=..., ?stkn=..., etc.) and hash
  str = str.split('?')[0].split('#')[0];
  // Remove leading @ and trailing slashes
  str = str.replace(/^@+/, '').replace(/\/+$/, '');
  
  try {
    str = decodeURIComponent(str);
  } catch (_) {}
  
  // Extract valid instagram username characters (a-z, 0-9, ., _)
  const match = str.match(/[a-zA-Z0-9._]+/);
  return match ? match[0].toLowerCase() : str.toLowerCase();
}
