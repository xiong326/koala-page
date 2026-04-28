export function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map(tag => String(tag || '').trim())
    .filter(Boolean);
}

export function getKoalaTags(koala) {
  return normalizeTags(koala?.tags);
}

export function tagMatches(tags, term) {
  const lowerTerm = term.toLowerCase();
  return normalizeTags(tags).some(tag => tag.toLowerCase().includes(lowerTerm));
}
