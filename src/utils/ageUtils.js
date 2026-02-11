import { parseKoalaDateString } from './dateUtils';

function parseKoalaEndDateString(endDateString) {
  if (!endDateString || typeof endDateString !== 'string') return null;

  const parts = endDateString
    .split('-')
    .map(p => p.trim())
    .filter(Boolean);

  if (parts.length === 1) {
    const year = Number(parts[0]);
    return Number.isFinite(year) ? new Date(year, 11, 31) : null;
  }

  if (parts.length === 2) {
    const year = Number(parts[0]);
    const month = Number(parts[1]); // 1-12
    return (Number.isFinite(year) && Number.isFinite(month)) ? new Date(year, month, 0) : null;
  }

  return parseKoalaDateString(endDateString);
}

function daysInMonth(year, monthIndex) {
  // monthIndex: 0-11
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Calculate an age difference between two date-only strings.
 *
 * - birthDateString: "YYYY" | "YYYY-MM" | "YYYY-MM-DD"
 * - endDateString:   same formats, or null for "now"
 *
 * Returns null if parsing fails.
 */
export function calculateAgeParts(birthDateString, endDateString = null) {
  if (!birthDateString) return null;

  const birth = parseKoalaDateString(birthDateString);
  if (!birth) return null;

  const end = endDateString ? parseKoalaEndDateString(endDateString) : new Date();
  if (!end || Number.isNaN(end.getTime())) return null;

  // Clamp negative ages (bad data / future birth dates)
  if (end < birth) {
    return { years: 0, months: 0, days: 0 };
  }

  let years = end.getFullYear() - birth.getFullYear();
  let months = end.getMonth() - birth.getMonth();
  let days = end.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const dim = daysInMonth(end.getFullYear(), (end.getMonth() + 11) % 12);
    days += dim;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) return { years: 0, months: 0, days: 0 };

  return { years, months, days };
}

/**
 * Integer age in years (used for filtering + upcoming birthday "turning X").
 */
export function calculateAgeInYears(birthDateString, endDateString = null) {
  const parts = calculateAgeParts(birthDateString, endDateString);
  if (!parts) return 0;
  return Math.max(0, parts.years);
}

/**
 * Age formatted choice helper: show months if under 1 year, otherwise years.
 * (The caller can localize the unit label.)
 */
export function getAgeForDisplay(birthDateString, endDateString = null) {
  const parts = calculateAgeParts(birthDateString, endDateString);
  if (!parts) return null;

  if (parts.years <= 0) {
    return { value: Math.max(0, parts.months), unit: 'months' };
  }

  return { value: parts.years, unit: 'years' };
}


