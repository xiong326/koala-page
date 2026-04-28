import { t } from '../i18n/translations';

export function getRelationshipDescription(rel, language) {
  if (!rel) return { description: '', details: '' };

  const params = {
    koala1: rel.koala1Name,
    koala2: rel.koala2Name,
    mother: rel.motherName,
    parent: rel.parentName,
    ancestor: rel.ancestorName,
    gens: rel.generations || rel.generationsApart,
  };

  switch (rel.type) {
    case 'self':
      return {
        description: t('relSelf', language),
        details: '',
      };
    case 'unknown':
      return {
        description: t('relUnknown', language),
        details: '',
      };
    case 'parent-child':
      return {
        description: t('relParentChild', language),
        details: rel.direction === 'koala1-is-mother'
          ? t('relParentChildDetail2', language, params)
          : rel.direction === 'koala1-is-father'
            ? t('relParentChildDetailFather2', language, params)
            : rel.direction === 'koala2-is-father'
              ? t('relParentChildDetailFather1', language, params)
              : t('relParentChildDetail1', language, params),
      };
    case 'siblings':
      return {
        description: rel.subtype === 'full' ? t('relFullSiblings', language) : t('relHalfSiblings', language),
        details: t('relSiblingsDetail', language, params),
      };
    case 'grandparent': {
      const grandparentSex = rel.direction === 'koala1-is-grandparent' ? rel.koala1Sex : rel.koala2Sex;
      const isMale = grandparentSex === 'male';

      return {
        description: isMale ? t('relGrandfather', language) : t('relGrandmother', language),
        details: rel.direction === 'koala1-is-grandparent'
          ? (isMale ? t('relGrandfatherDetail1', language, params) : t('relGrandmotherDetail1', language, params))
          : (isMale ? t('relGrandfatherDetail2', language, params) : t('relGrandmotherDetail2', language, params)),
      };
    }
    case 'ancestor':
      return {
        description: t('relAncestor', language),
        details: rel.direction === 'koala1-is-ancestor'
          ? t('relAncestorDetail1', language, params)
          : t('relAncestorDetail2', language, params),
      };
    case 'aunt-niece': {
      const auntSex = rel.direction === 'koala1-is-aunt' ? rel.koala1Sex : rel.koala2Sex;
      const isAuntMale = auntSex === 'male';

      return {
        description: isAuntMale ? t('relUncleNiece', language) : t('relAuntNiece', language),
        details: rel.direction === 'koala1-is-aunt'
          ? (isAuntMale ? t('relUncleNieceDetail1', language, params) : t('relAuntNieceDetail1', language, params))
          : (isAuntMale ? t('relUncleNieceDetail2', language, params) : t('relAuntNieceDetail2', language, params)),
      };
    }
    case 'cousins':
      return {
        description: t('relCousins', language),
        details: t('relCousinsDetail', language, params),
      };
    case 'related':
      return {
        description: t('relRelated', language),
        details: t('relRelatedDetail', language, params),
      };
    case 'unrelated':
      return {
        description: t('relUnrelated', language),
        details: t('relUnrelatedDetail', language),
      };
    default:
      return { description: '', details: '' };
  }
}
