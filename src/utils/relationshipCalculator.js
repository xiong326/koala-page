/**
 * Find the path from one koala to another through ancestors
 */
function findPathToAncestor(fromId, toId, koalas, visited = new Set()) {
  if (fromId === toId) return [fromId];
  if (visited.has(fromId)) return null;
  visited.add(fromId);

  const koala = koalas.find(k => k.id === fromId);
  if (!koala || !koala.mother) return null;

  const path = findPathToAncestor(koala.mother, toId, koalas, visited);
  if (path) return [fromId, ...path];
  return null;
}

/**
 * Find the path between two koalas
 */
export function findPathBetweenKoalas(koala1Id, koala2Id, koalas) {
  if (koala1Id === koala2Id) return [koala1Id];

  // Check if one is direct ancestor of the other
  const pathDown = findPathToAncestor(koala1Id, koala2Id, koalas);
  if (pathDown) return pathDown;

  const pathUp = findPathToAncestor(koala2Id, koala1Id, koalas);
  if (pathUp) return pathUp;

  // Find common ancestor and build path through it
  const commonAncestor = findCommonAncestor(koala1Id, koala2Id, koalas);
  if (commonAncestor) {
    const path1 = findPathToAncestor(koala1Id, commonAncestor, koalas);
    const path2 = findPathToAncestor(koala2Id, commonAncestor, koalas);

    if (path1 && path2) {
      // Remove duplicate common ancestor and combine paths
      return [...path1.slice(0, -1), ...path2.reverse()];
    }
  }

  return [];
}

/**
 * Find common ancestor between two koalas
 */
function findCommonAncestor(koala1Id, koala2Id, koalas) {
  // Get all ancestors of koala1
  const ancestors1 = new Set();
  let current = koala1Id;
  while (current) {
    ancestors1.add(current);
    const koala = koalas.find(k => k.id === current);
    current = koala?.mother;
  }

  // Find first common ancestor in koala2's ancestry
  current = koala2Id;
  while (current) {
    if (ancestors1.has(current)) {
      return current;
    }
    const koala = koalas.find(k => k.id === current);
    current = koala?.mother;
  }

  return null;
}

/**
 * Check if koala1 is a direct ancestor of koala2
 */
function isAncestor(ancestorId, descendantId, koalas) {
  let current = descendantId;
  while (current) {
    if (current === ancestorId) return true;
    const koala = koalas.find(k => k.id === current);
    current = koala?.mother;
  }
  return false;
}

/**
 * Count generations between two koalas through a path
 */
function countGenerations(fromId, toId, koalas) {
  let count = 0;
  let current = fromId;
  while (current && current !== toId) {
    count++;
    const koala = koalas.find(k => k.id === current);
    current = koala?.mother;
    if (count > 20) break; // Safety limit
  }
  return current === toId ? count : -1;
}

/**
 * Get all children of a koala
 */
function getChildren(koalaId, koalas) {
  return koalas.filter(k => k.mother === koalaId);
}

/**
 * Calculate the relationship between two koalas
 */
export function calculateRelationship(koala1Id, koala2Id, koalas) {
  const path = findPathBetweenKoalas(koala1Id, koala2Id, koalas);

  if (koala1Id === koala2Id) {
    return {
      type: 'self',
      koala1Name: '',
      koala2Name: '',
      path: [koala1Id]
    };
  }

  const koala1 = koalas.find(k => k.id === koala1Id);
  const koala2 = koalas.find(k => k.id === koala2Id);

  if (!koala1 || !koala2) {
    return {
      type: 'unknown',
      koala1Name: koala1?.name || '',
      koala2Name: koala2?.name || '',
      path: []
    };
  }

  // Check direct parent-child relationship
  if (koala1.mother === koala2Id) {
    return {
      type: 'parent-child',
      direction: 'koala2-is-mother',
      koala1Name: koala1.name,
      koala2Name: koala2.name,
      path: path
    };
  }
  if (koala2.mother === koala1Id) {
    return {
      type: 'parent-child',
      direction: 'koala1-is-mother',
      koala1Name: koala1.name,
      koala2Name: koala2.name,
      path: path
    };
  }

  // Check siblings (same mother)
  if (koala1.mother && koala1.mother === koala2.mother) {
    const mother = koalas.find(k => k.id === koala1.mother);
    return {
      type: 'siblings',
      koala1Name: koala1.name,
      koala2Name: koala2.name,
      motherName: mother?.name || '',
      path: path
    };
  }

  // Check if one is ancestor of the other
  if (isAncestor(koala1Id, koala2Id, koalas)) {
    const generations = countGenerations(koala2Id, koala1Id, koalas);
    if (generations === 2) {
      return {
        type: 'grandparent',
        direction: 'koala1-is-grandparent',
        koala1Name: koala1.name,
        koala2Name: koala2.name,
        path: path
      };
    } else if (generations > 2) {
      return {
        type: 'ancestor',
        direction: 'koala1-is-ancestor',
        generations: generations,
        koala1Name: koala1.name,
        koala2Name: koala2.name,
        path: path
      };
    }
  }

  if (isAncestor(koala2Id, koala1Id, koalas)) {
    const generations = countGenerations(koala1Id, koala2Id, koalas);
    if (generations === 2) {
      return {
        type: 'grandparent',
        direction: 'koala2-is-grandparent',
        koala1Name: koala1.name,
        koala2Name: koala2.name,
        path: path
      };
    } else if (generations > 2) {
      return {
        type: 'ancestor',
        direction: 'koala2-is-ancestor',
        generations: generations,
        koala1Name: koala1.name,
        koala2Name: koala2.name,
        path: path
      };
    }
  }

  // Find common ancestor for other relationships
  const commonAncestor = findCommonAncestor(koala1Id, koala2Id, koalas);
  if (commonAncestor) {
    const gen1 = countGenerations(koala1Id, commonAncestor, koalas);
    const gen2 = countGenerations(koala2Id, commonAncestor, koalas);

    // Aunt/Niece relationship
    if (gen1 === 1 && gen2 === 2) {
      return {
        type: 'aunt-niece',
        direction: 'koala1-is-aunt',
        koala1Name: koala1.name,
        koala2Name: koala2.name,
        path: path
      };
    }
    if (gen1 === 2 && gen2 === 1) {
      return {
        type: 'aunt-niece',
        direction: 'koala2-is-aunt',
        koala1Name: koala1.name,
        koala2Name: koala2.name,
        path: path
      };
    }

    // Cousins (same grandparent, 2 generations up for both)
    if (gen1 === 2 && gen2 === 2) {
      const ancestor = koalas.find(k => k.id === commonAncestor);
      return {
        type: 'cousins',
        koala1Name: koala1.name,
        koala2Name: koala2.name,
        ancestorName: ancestor?.name || '',
        path: path
      };
    }

    // Extended family
    if (gen1 > 0 && gen2 > 0) {
      const ancestor = koalas.find(k => k.id === commonAncestor);
      return {
        type: 'related',
        koala1Name: koala1.name,
        koala2Name: koala2.name,
        generationsApart: gen1 + gen2,
        ancestorName: ancestor?.name || '',
        path: path
      };
    }
  }

  return {
    type: 'unrelated',
    koala1Name: koala1.name,
    koala2Name: koala2.name,
    path: []
  };
}
