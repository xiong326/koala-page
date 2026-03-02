import { localDateToISODateString } from './dateUtils';
import { calculateAgeInYears } from './ageUtils';
import { getPhotoUrl } from './imageUtils';

// Backwards-compatible re-export (older callers may import from graphHelpers)
export { calculateAgeInYears } from './ageUtils';

function buildKoalaLabel(koala) {
  const genderSymbol = koala.sex === 'female' ? ' ♀' : koala.sex === 'male' ? ' ♂' : '';
  const deceasedSymbol = koala.deceased ? ' †' : '';
  const birthYear = koala.birthDate ? koala.birthDate.split('-')[0] : '';
  return koala.name + genderSymbol + deceasedSymbol + (birthYear ? '\n' + birthYear : '');
}

/**
 * Convert koala data to Cytoscape graph elements.
 * Returns { primaryElements, proxyElements } where:
 * - primaryElements: original nodes + mother->child edges (dagre layout)
 * - proxyElements: proxy father nodes + mate edges (added as satellites after layout)
 */
export function koalasToGraphElements(koalas) {
  const koalaMap = new Map(koalas.map(k => [k.id, k]));

  const nodes = koalas.map(koala => ({
    data: {
      id: koala.id,
      label: buildKoalaLabel(koala),
      ...koala,
      photo: getPhotoUrl(koala.photo, 'thumb'),
    }
  }));

  const motherEdges = [];
  koalas.forEach(koala => {
    if (koala.mother) {
      motherEdges.push({
        data: {
          id: `${koala.mother}-${koala.id}`,
          source: koala.mother,
          target: koala.id,
          edgeType: 'mother-child',
        }
      });
    }
  });

  // Collect unique (mother, father) mating pairs
  const matingPairs = new Map();
  koalas.forEach(koala => {
    if (koala.mother && koala.father) {
      const key = `${koala.mother}-${koala.father}`;
      if (!matingPairs.has(key)) {
        matingPairs.set(key, { motherId: koala.mother, fatherId: koala.father });
      }
    }
  });

  const proxyNodes = [];
  const mateEdges = [];

  for (const { motherId, fatherId } of matingPairs.values()) {
    const father = koalaMap.get(fatherId);
    if (!father) continue;

    const proxyId = `${fatherId}_m_${motherId}`;
    proxyNodes.push({
      data: {
        id: proxyId,
        label: buildKoalaLabel(father),
        ...father,
        // Override id-level fields for the proxy
        id: proxyId,
        nodeType: 'proxy',
        originalId: fatherId,
        mateOf: motherId,
        photo: getPhotoUrl(father.photo, 'thumb'),
      },
      classes: 'proxy',
    });

    mateEdges.push({
      data: {
        id: `mate_${proxyId}_${motherId}`,
        source: proxyId,
        target: motherId,
        edgeType: 'mate',
      },
      classes: 'mate-edge',
    });
  }

  return {
    primaryElements: [...nodes, ...motherEdges],
    proxyElements: [...proxyNodes, ...mateEdges],
  };
}

/**
 * Get all descendants of a koala
 */
export function getDescendants(koalaId, koalas) {
  const descendants = new Set();

  function findChildren(id) {
    koalas.forEach(koala => {
      if (koala.mother === id || koala.father === id) {
        descendants.add(koala.id);
        findChildren(koala.id);
      }
    });
  }

  findChildren(koalaId);
  return Array.from(descendants);
}

/**
 * Get all ancestors of a koala
 */
export function getAncestors(koalaId, koalas) {
  const ancestors = new Set();

  function findParents(id) {
    const koala = koalas.find(k => k.id === id);
    if (koala) {
      if (koala.mother) {
        ancestors.add(koala.mother);
        findParents(koala.mother);
      }
      if (koala.father) {
        ancestors.add(koala.father);
        findParents(koala.father);
      }
    }
  }

  findParents(koalaId);
  return Array.from(ancestors);
}

/**
 * Get ancestor path (all direct ancestors including both maternal and paternal lines)
 */
export function getAncestorPath(koalaId, koalas) {
  const ancestors = new Set([koalaId]);
  const toProcess = [koalaId];

  while (toProcess.length > 0) {
    const currentId = toProcess.shift();
    const koala = koalas.find(k => k.id === currentId);

    if (koala) {
      if (koala.mother && !ancestors.has(koala.mother)) {
        ancestors.add(koala.mother);
        toProcess.push(koala.mother);
      }
      if (koala.father && !ancestors.has(koala.father)) {
        ancestors.add(koala.father);
        toProcess.push(koala.father);
      }
    }
  }

  return Array.from(ancestors);
}

/**
 * Get ancestors and descendants for highlighting lineage.
 */
export function getLineageHighlight(koalaId, koalas) {
  const ancestorPath = getAncestorPath(koalaId, koalas);
  const descendants = getDescendants(koalaId, koalas);
  const allNodes = [...new Set([...ancestorPath, ...descendants])];
  return { nodes: allNodes };
}

/**
 * Get connected component (family) of a koala
 */
export function getConnectedFamily(koalaId, koalas) {
  const family = new Set([koalaId]);
  const descendants = getDescendants(koalaId, koalas);
  const ancestors = getAncestors(koalaId, koalas);

  descendants.forEach(id => family.add(id));
  ancestors.forEach(id => family.add(id));

  // Also add descendants of ancestors (siblings, cousins, etc.)
  ancestors.forEach(ancestorId => {
    const desc = getDescendants(ancestorId, koalas);
    desc.forEach(id => family.add(id));
  });

  return Array.from(family);
}

/**
 * Filter koalas by search term
 */
export function searchKoalas(koalas, searchTerm) {
  if (!searchTerm) return koalas;

  const term = searchTerm.toLowerCase();
  return koalas.filter(koala => {
    // Safe check for name
    const nameMatch = koala.name?.toLowerCase().includes(term) || false;

    // Safe check for nicknames array
    const nicknameMatch = Array.isArray(koala.nicknames)
      ? koala.nicknames.some(nickname => nickname?.toLowerCase().includes(term))
      : false;

    // Safe check for id
    const idMatch = koala.id?.toLowerCase().includes(term) || false;

    return nameMatch || nicknameMatch || idMatch;
  });
}

/**
 * Calculate the generation of a koala (1 = founder, 2 = second generation, etc.)
 */
export function calculateGeneration(koalaId, koalas) {
  const koala = koalas.find(k => k.id === koalaId);
  if (!koala) return 1;

  // If no mother and no father, this is a founder (generation 1)
  if (!koala.mother && !koala.father) return 1;

  let motherGeneration = 0;
  let fatherGeneration = 0;
  if (koala.mother) {
    motherGeneration = calculateGeneration(koala.mother, koalas);
  }
  if (koala.father) {
    fatherGeneration = calculateGeneration(koala.father, koalas);
  }

  return 1 + Math.max(motherGeneration, fatherGeneration);
}

/**
 * Get upcoming birthdays within the next N days
 */
export function getUpcomingBirthdays(koalas, daysAhead = 60) {
  const today = new Date();
  const upcomingBirthdays = [];

  koalas.forEach(koala => {
    // Skip deceased koalas
    if (koala.deceased) return;

    // Only process koalas with full birth dates (YYYY-MM-DD)
    if (!koala.birthDate || koala.birthDate.split('-').length !== 3) return;

    const [year, month, day] = koala.birthDate.split('-').map(Number);

    // Calculate next birthday
    const currentYear = today.getFullYear();
    let nextBirthday = new Date(currentYear, month - 1, day);

    // If birthday already passed this year, use next year
    if (nextBirthday < today) {
      nextBirthday = new Date(currentYear + 1, month - 1, day);
    }

    // Calculate days until birthday
    const daysUntil = Math.floor((nextBirthday - today) / (1000 * 60 * 60 * 24));

    // Only include birthdays within the specified range
    if (daysUntil >= 0 && daysUntil <= daysAhead) {
      // Avoid `toISOString().split('T')[0]` here: it converts to UTC and can shift the date by 1 day.
      const upcomingAge = calculateAgeInYears(koala.birthDate, localDateToISODateString(nextBirthday));

      upcomingBirthdays.push({
        koala,
        date: nextBirthday,
        daysUntil,
        upcomingAge,
        monthDay: `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`
      });
    }
  });

  // Sort by date (closest first)
  upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);

  return upcomingBirthdays;
}
