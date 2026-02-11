/**
 * Utilities for dealing with "date-only" strings from our JSON (e.g. "2024", "2024-05", "2024-05-10").
 *
 * Important: In JavaScript, `new Date("YYYY-MM-DD")` is parsed as UTC, which can display as +/- 1 day
 * in local timezones. These helpers parse into *local* dates to avoid that shift.
 */

export function parseKoalaDateString(dateString) {
  if (!dateString || typeof dateString !== 'string') return null;

  const parts = dateString
    .split('-')
    .map(p => p.trim())
    .filter(Boolean);

  const year = Number(parts[0]);
  if (!Number.isFinite(year)) return null;

  if (parts.length === 1) {
    // Year only: "2024"
    return new Date(year, 0, 1);
  }

  const month = Number(parts[1]);
  if (!Number.isFinite(month)) return null;

  if (parts.length === 2) {
    // Year-Month: "2024-05"
    return new Date(year, month - 1, 1);
  }

  const day = Number(parts[2]);
  if (!Number.isFinite(day)) return null;

  // Full date: "2024-05-10"
  return new Date(year, month - 1, day);
}

export function localDateToISODateString(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}


