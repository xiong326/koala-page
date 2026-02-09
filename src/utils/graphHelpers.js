/**
 * Convert koala data to Cytoscape graph elements
 */
export function koalasToGraphElements(koalas) {
  const nodes = koalas.map(koala => {
    // Add gender symbol to label
    const genderSymbol = koala.sex === 'female' ? ' ♀' : koala.sex === 'male' ? ' ♂' : '';
    // Add deceased symbol
    const deceasedSymbol = koala.deceased ? ' †' : '';
    // Format birth date (just year)
    const birthYear = koala.birthDate ? koala.birthDate.split('-')[0] : '';
    // Combine name with symbols and birth year on new line
    const label = koala.name + genderSymbol + deceasedSymbol + (birthYear ? '\n' + birthYear : '');

    return {
      data: {
        id: koala.id,
        label: label,
        ...koala
      }
    };
  });

  const edges = [];
  koalas.forEach(koala => {
    // Matriarchal society: only show mother -> child relationships in the graph
    if (koala.mother) {
      edges.push({
        data: {
          id: `${koala.mother}-${koala.id}`,
          source: koala.mother,
          target: koala.id
        }
      });
    }
  });

  return [...nodes, ...edges];
}

/**
 * Get all descendants of a koala
 */
export function getDescendants(koalaId, koalas) {
  const descendants = new Set();

  function findChildren(id) {
    koalas.forEach(koala => {
      if (koala.mother === id) {
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
    if (koala && koala.mother) {
      ancestors.add(koala.mother);
      findParents(koala.mother);
    }
  }

  findParents(koalaId);
  return Array.from(ancestors);
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
