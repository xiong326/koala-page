/**
 * Find the path from one koala to another through ancestors (BFS to find shortest path)
 */
function findPathToAncestor(fromId, toId, koalas) {
  if (fromId === toId) return [fromId];

  const queue = [[fromId]];
  const visited = new Set([fromId]);

  while (queue.length > 0) {
    const path = queue.shift();
    const currentId = path[path.length - 1];
    const koala = koalas.find(k => k.id === currentId);

    if (!koala) continue;

    // Check both parents
    const parents = [];
    if (koala.mother) parents.push(koala.mother);
    if (koala.father) parents.push(koala.father);

    for (const parentId of parents) {
      if (parentId === toId) {
        return [...path, parentId];
      }

      if (!visited.has(parentId)) {
        visited.add(parentId);
        queue.push([...path, parentId]);
      }
    }
  }

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
 * Find Most Recent Common Ancestor (MRCA) between two koalas using BFS
 */
function findCommonAncestor(koala1Id, koala2Id, koalas) {
  // Get all ancestors of koala1 with their generation distance
  const ancestors1 = new Map(); // id -> distance
  const queue1 = [[koala1Id, 0]];

  while (queue1.length > 0) {
    const [currentId, distance] = queue1.shift();

    if (ancestors1.has(currentId)) continue;
    ancestors1.set(currentId, distance);

    const koala = koalas.find(k => k.id === currentId);
    if (koala) {
      if (koala.mother) queue1.push([koala.mother, distance + 1]);
      if (koala.father) queue1.push([koala.father, distance + 1]);
    }
  }

  // BFS from koala2 to find first common ancestor (which will be the MRCA)
  const queue2 = [[koala2Id, 0]];
  const visited2 = new Set();

  while (queue2.length > 0) {
    const [currentId, distance] = queue2.shift();

    if (visited2.has(currentId)) continue;
    visited2.add(currentId);

    // Check if this is a common ancestor
    if (ancestors1.has(currentId)) {
      return currentId;
    }

    const koala = koalas.find(k => k.id === currentId);
    if (koala) {
      if (koala.mother) queue2.push([koala.mother, distance + 1]);
      if (koala.father) queue2.push([koala.father, distance + 1]);
    }
  }

  return null;
}

/**
 * Check if koala1 is a direct ancestor of koala2 (BFS through both parents)
 */
function isAncestor(ancestorId, descendantId, koalas) {
  if (ancestorId === descendantId) return true;

  const queue = [descendantId];
  const visited = new Set([descendantId]);

  while (queue.length > 0) {
    const currentId = queue.shift();
    const koala = koalas.find(k => k.id === currentId);

    if (!koala) continue;

    if (koala.mother === ancestorId || koala.father === ancestorId) {
      return true;
    }

    if (koala.mother && !visited.has(koala.mother)) {
      visited.add(koala.mother);
      queue.push(koala.mother);
    }
    if (koala.father && !visited.has(koala.father)) {
      visited.add(koala.father);
      queue.push(koala.father);
    }
  }

  return false;
}

/**
 * Count generations between two koalas (BFS to find shortest path)
 */
function countGenerations(fromId, toId, koalas) {
  if (fromId === toId) return 0;

  const queue = [[fromId, 0]];
  const visited = new Set([fromId]);

  while (queue.length > 0) {
    const [currentId, distance] = queue.shift();

    if (currentId === toId) return distance;

    const koala = koalas.find(k => k.id === currentId);
    if (!koala) continue;

    if (koala.mother && !visited.has(koala.mother)) {
      visited.add(koala.mother);
      queue.push([koala.mother, distance + 1]);
    }
    if (koala.father && !visited.has(koala.father)) {
      visited.add(koala.father);
      queue.push([koala.father, distance + 1]);
    }

    if (distance > 20) break; // Safety limit
  }

  return -1;
}

/**
 * Get all children of a koala (either as mother or father)
 */
function getChildren(koalaId, koalas) {
  return koalas.filter(k => k.mother === koalaId || k.father === koalaId);
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
  if (koala1.father === koala2Id) {
    return {
      type: 'parent-child',
      direction: 'koala2-is-father',
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
  if (koala2.father === koala1Id) {
    return {
      type: 'parent-child',
      direction: 'koala1-is-father',
      koala1Name: koala1.name,
      koala2Name: koala2.name,
      path: path
    };
  }

  // Check siblings (full or half)
  const sameMother = koala1.mother && koala1.mother === koala2.mother;
  const sameFather = koala1.father && koala1.father === koala2.father;

  if (sameMother || sameFather) {
    const isFull = sameMother && sameFather;
    const parent = sameMother
      ? koalas.find(k => k.id === koala1.mother)
      : koalas.find(k => k.id === koala1.father);

    return {
      type: 'siblings',
      subtype: isFull ? 'full' : 'half',
      koala1Name: koala1.name,
      koala2Name: koala2.name,
      parentName: parent?.name || '',
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
        koala1Sex: koala1.sex,
        koala2Name: koala2.name,
        koala2Sex: koala2.sex,
        path: path
      };
    } else if (generations > 2) {
      return {
        type: 'ancestor',
        direction: 'koala1-is-ancestor',
        generations: generations,
        koala1Name: koala1.name,
        koala1Sex: koala1.sex,
        koala2Name: koala2.name,
        koala2Sex: koala2.sex,
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
        koala1Sex: koala1.sex,
        koala2Name: koala2.name,
        koala2Sex: koala2.sex,
        path: path
      };
    } else if (generations > 2) {
      return {
        type: 'ancestor',
        direction: 'koala2-is-ancestor',
        generations: generations,
        koala1Name: koala1.name,
        koala1Sex: koala1.sex,
        koala2Name: koala2.name,
        koala2Sex: koala2.sex,
        path: path
      };
    }
  }

  // Find common ancestor for other relationships
  const commonAncestor = findCommonAncestor(koala1Id, koala2Id, koalas);
  if (commonAncestor) {
    const gen1 = countGenerations(koala1Id, commonAncestor, koalas);
    const gen2 = countGenerations(koala2Id, commonAncestor, koalas);

    // Aunt/Uncle-Niece/Nephew relationship
    if (gen1 === 1 && gen2 === 2) {
      return {
        type: 'aunt-niece',
        direction: 'koala1-is-aunt',
        koala1Name: koala1.name,
        koala1Sex: koala1.sex,
        koala2Name: koala2.name,
        koala2Sex: koala2.sex,
        path: path
      };
    }
    if (gen1 === 2 && gen2 === 1) {
      return {
        type: 'aunt-niece',
        direction: 'koala2-is-aunt',
        koala1Name: koala1.name,
        koala1Sex: koala1.sex,
        koala2Name: koala2.name,
        koala2Sex: koala2.sex,
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
