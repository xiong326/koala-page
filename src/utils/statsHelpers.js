import { calculateAgeInYears, calculateAgeParts, getAgeForDisplay } from './ageUtils';
import { calculateGeneration } from './graphHelpers';

export function enrichKoala(koala, allKoalas) {
  const endDate = koala.deceased ? koala.dateOfDeath : null;
  const ageParts = calculateAgeParts(koala.birthDate, endDate);
  const preciseAge = ageParts
    ? ageParts.years + ageParts.months / 12 + ageParts.days / 365
    : 0;
  return {
    ...koala,
    ageInYears: calculateAgeInYears(koala.birthDate, endDate),
    preciseAge,
    ageForDisplay: getAgeForDisplay(koala.birthDate, endDate),
    generation: calculateGeneration(koala.id, allKoalas),
  };
}

export function enrichAll(koalas) {
  return koalas.map(k => enrichKoala(k, koalas));
}

export function computePopulationStats(koalas) {
  const total = koalas.length;
  const alive = koalas.filter(k => !k.deceased).length;
  const deceased = total - alive;
  const males = koalas.filter(k => k.sex === 'male').length;
  const females = koalas.filter(k => k.sex === 'female').length;

  return { total, alive, deceased, males, females };
}

export function computeAgeStats(koalas) {
  if (koalas.length === 0) {
    return { averageAge: 0, oldest: null, youngest: null, avgLifespan: 0 };
  }

  const ages = koalas.map(k => k.ageInYears);
  const averageAge = +(ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1);

  const sorted = [...koalas].sort((a, b) => b.preciseAge - a.preciseAge);
  const oldest = sorted[0];
  const youngest = sorted[sorted.length - 1];

  const deceasedKoalas = koalas.filter(k => k.deceased);
  const avgLifespan = deceasedKoalas.length > 0
    ? +(deceasedKoalas.reduce((sum, k) => sum + k.ageInYears, 0) / deceasedKoalas.length).toFixed(1)
    : 0;

  return { averageAge, oldest, youngest, avgLifespan, deceasedCount: deceasedKoalas.length };
}

const AGE_BUCKETS = [
  { key: '0-1', min: 0, max: 1 },
  { key: '1-3', min: 1, max: 3 },
  { key: '3-5', min: 3, max: 5 },
  { key: '5-10', min: 5, max: 10 },
  { key: '10-15', min: 10, max: 15 },
  { key: '15-20', min: 15, max: 20 },
  { key: '20+', min: 20, max: Infinity },
];

export function computeAgeDistribution(koalas) {
  return AGE_BUCKETS.map(bucket => ({
    range: bucket.key,
    count: koalas.filter(k => k.ageInYears >= bucket.min && k.ageInYears < bucket.max).length,
  }));
}

const MONTH_KEYS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
];

export function computeBirthMonthDistribution(koalas) {
  const counts = new Array(12).fill(0);
  koalas.forEach(k => {
    if (!k.birthDate) return;
    const parts = k.birthDate.split('-');
    if (parts.length >= 2) {
      const month = parseInt(parts[1], 10);
      if (month >= 1 && month <= 12) counts[month - 1]++;
    }
  });
  return MONTH_KEYS.map((key, i) => ({ month: key, count: counts[i] }));
}

export function computeOffspringRanking(filteredKoalas, allKoalas) {
  const pool = allKoalas || filteredKoalas;
  const filteredIds = new Set(filteredKoalas.map(k => k.id));

  const offspringCount = {};
  filteredIds.forEach(id => { offspringCount[id] = 0; });

  pool.forEach(k => {
    if (k.mother && filteredIds.has(k.mother)) {
      offspringCount[k.mother]++;
    }
    if (k.father && filteredIds.has(k.father)) {
      offspringCount[k.father]++;
    }
  });

  return Object.entries(offspringCount)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => {
      const koala = pool.find(k => k.id === id);
      return { id, name: koala?.name || id, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export function computeGenerationDistribution(koalas) {
  const genCounts = {};
  koalas.forEach(k => {
    const g = k.generation;
    genCounts[g] = (genCounts[g] || 0) + 1;
  });

  const gens = Object.keys(genCounts).map(Number).sort((a, b) => a - b);
  return gens.map(g => ({ generation: g, count: genCounts[g] }));
}

export function computeFounderStats(koalas) {
  const founders = koalas.filter(k => !k.mother && !k.father);
  const maxGen = koalas.reduce((max, k) => Math.max(max, k.generation), 0);
  return { founderCount: founders.length, deepestGeneration: maxGen };
}

export function computeBirthsPerYear(koalas) {
  const yearCounts = {};
  koalas.forEach(k => {
    if (!k.birthDate) return;
    const year = parseInt(k.birthDate.split('-')[0], 10);
    if (Number.isFinite(year)) {
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    }
  });

  const years = Object.keys(yearCounts).map(Number).sort((a, b) => a - b);
  return years.map(y => ({ year: y, count: yearCounts[y] }));
}
