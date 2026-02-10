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
    // Add mother -> child relationships
    if (koala.mother) {
      edges.push({
        data: {
          id: `${koala.mother}-${koala.id}`,
          source: koala.mother,
          target: koala.id
        }
      });
    }
    // Add father -> child relationships
    if (koala.father) {
      edges.push({
        data: {
          id: `${koala.father}-${koala.id}`,
          source: koala.father,
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
 * Get ancestors and descendants for highlighting lineage
 */
export function getLineageHighlight(koalaId, koalas) {
  // Get ancestor path (ordered)
  const ancestorPath = getAncestorPath(koalaId, koalas);

  // Get all descendants
  const descendants = getDescendants(koalaId, koalas);

  // Combine all nodes to highlight (remove duplicates)
  const allNodes = [...new Set([...ancestorPath, ...descendants])];

  return {
    nodes: allNodes,
    ancestorPath: ancestorPath  // Keep ordered path for edge highlighting
  };
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

  // If no mother, this is a founder (generation 1)
  if (!koala.mother) return 1;

  // Otherwise, generation is 1 + mother's generation
  return 1 + calculateGeneration(koala.mother, koalas);
}

/**
 * Calculate age in years (integer)
 */
export function calculateAgeInYears(birthDate, endDate = null) {
  if (!birthDate) return 0;

  const birth = new Date(birthDate);
  let end;

  if (endDate) {
    // Handle partial dates for endDate
    const parts = endDate.split('-');
    if (parts.length === 1) {
      // Year only: use end of year
      end = new Date(parts[0] + '-12-31');
    } else if (parts.length === 2) {
      // Year-Month: use end of month
      const [year, month] = parts;
      end = new Date(year, month, 0); // Day 0 = last day of previous month
    } else {
      end = new Date(endDate);
    }
  } else {
    end = new Date();
  }

  const years = end.getFullYear() - birth.getFullYear();
  const monthDiff = end.getMonth() - birth.getMonth();
  const dayDiff = end.getDate() - birth.getDate();

  // Adjust if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    return Math.max(0, years - 1);
  }

  return Math.max(0, years);
}
