import { useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import { parseKoalaDateString } from '../utils/dateUtils';
import { getAgeForDisplay } from '../utils/ageUtils';
import { getDescendants, getAncestors, calculateGeneration } from '../utils/graphHelpers';
import { getPhotoUrl } from '../utils/imageUtils';

function KoalaLink({ name, koalaId, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(koalaId)}
      className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
    >
      {name}
    </button>
  );
}

function SectionHeader({ children }) {
  return (
    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">{children}</h3>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="font-semibold text-gray-500 whitespace-nowrap min-w-[100px]">{label}</span>
      <span className="text-gray-800">{children}</span>
    </div>
  );
}

export default function KoalaDetailModal({ koala, allKoalas, onClose, onKoalaClick }) {
  const { language } = useLanguage();

  const sortedByBirth = useMemo(() => {
    return [...allKoalas].sort((a, b) => {
      const da = parseKoalaDateString(a.birthDate);
      const db = parseKoalaDateString(b.birthDate);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da - db;
    });
  }, [allKoalas]);

  const currentIndex = useMemo(
    () => sortedByBirth.findIndex(k => k.id === koala.id),
    [sortedByBirth, koala.id],
  );

  const prevKoala = currentIndex > 0 ? sortedByBirth[currentIndex - 1] : null;
  const nextKoala = currentIndex < sortedByBirth.length - 1 ? sortedByBirth[currentIndex + 1] : null;

  const getKoala = (id) => allKoalas.find(k => k.id === id) || null;

  const formatDate = (dateString) => {
    if (!dateString) return t('unknown', language);
    const locale = language === 'zh' ? 'zh-CN' : 'en-US';
    const parts = dateString.split('-');
    if (parts.length === 1) return parts[0];
    const date = parseKoalaDateString(dateString);
    if (!date) return t('unknown', language);
    if (parts.length === 2) {
      return date.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
    }
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatAge = (birthDate, endDate = null) => {
    const age = getAgeForDisplay(birthDate, endDate);
    if (!age) return t('unknown', language);
    return `${age.value} ${t(age.unit, language)}`;
  };

  const generation = useMemo(
    () => calculateGeneration(koala.id, allKoalas),
    [koala.id, allKoalas],
  );

  const offspring = useMemo(
    () => allKoalas
      .filter(k => k.mother === koala.id || k.father === koala.id)
      .sort((a, b) => {
        const da = parseKoalaDateString(a.birthDate);
        const db = parseKoalaDateString(b.birthDate);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return da - db;
      }),
    [koala.id, allKoalas],
  );

  const siblings = useMemo(() => {
    const full = [];
    const half = [];
    allKoalas.forEach(k => {
      if (k.id === koala.id) return;
      const sameMother = koala.mother && k.mother === koala.mother;
      const sameFather = koala.father && k.father === koala.father;
      if (sameMother && sameFather) full.push(k);
      else if (sameMother || sameFather) half.push(k);
    });
    return { full, half };
  }, [koala, allKoalas]);

  const mates = useMemo(() => {
    const mateIds = new Set();
    offspring.forEach(child => {
      const otherParent = child.mother === koala.id ? child.father : child.mother;
      if (otherParent) mateIds.add(otherParent);
    });
    return [...mateIds].map(id => getKoala(id)).filter(Boolean);
  }, [offspring, koala.id, allKoalas]);

  const motherKoala = getKoala(koala.mother);
  const fatherKoala = getKoala(koala.father);

  const grandparents = useMemo(() => ({
    maternalGrandmother: motherKoala ? getKoala(motherKoala.mother) : null,
    maternalGrandfather: motherKoala ? getKoala(motherKoala.father) : null,
    paternalGrandmother: fatherKoala ? getKoala(fatherKoala.mother) : null,
    paternalGrandfather: fatherKoala ? getKoala(fatherKoala.father) : null,
  }), [motherKoala, fatherKoala, allKoalas]);

  const familyStats = useMemo(() => {
    const descendants = getDescendants(koala.id, allKoalas);
    const ancestors = getAncestors(koala.id, allKoalas);
    let deepestDescGen = 0;
    if (descendants.length > 0) {
      descendants.forEach(dId => {
        const g = calculateGeneration(dId, allKoalas);
        if (g > deepestDescGen) deepestDescGen = g;
      });
    }
    return {
      descendantCount: descendants.length,
      ancestorCount: ancestors.length,
      deepestDescGen,
    };
  }, [koala.id, allKoalas]);

  const hasGrandparents = Object.values(grandparents).some(Boolean);

  const handleNav = (targetKoala) => {
    if (targetKoala && onKoalaClick) {
      onKoalaClick(targetKoala.id);
    }
  };

  if (!koala) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-gray-50 w-[90vw] max-w-3xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => handleNav(prevKoala)}
              disabled={!prevKoala}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              title={t('detailPrev', language)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                {koala.name}
                <span className="ml-1.5 text-base font-normal text-gray-400">
                  {koala.sex === 'female' ? '♀' : koala.sex === 'male' ? '♂' : ''}
                </span>
                {koala.deceased && <span className="ml-1 text-base font-normal text-gray-400">†</span>}
              </h2>
              {koala.nicknames && koala.nicknames.length > 0 && (
                <p className="text-xs text-gray-500 truncate">{koala.nicknames.join(', ')}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleNav(nextKoala)}
              disabled={!nextKoala}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              title={t('detailNext', language)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors ml-3 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">

          {/* Photo + Basic Info row */}
          <section>
            <SectionHeader>{t('detailBasicInfo', language)}</SectionHeader>
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex gap-4">
              <div className="flex-shrink-0">
                {koala.photo ? (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src={getPhotoUrl(koala.photo, 'medium')} alt={koala.name} loading="lazy" width={128} height={128} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-4xl">🐨</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <InfoRow label={`${t('sex', language)}:`}>
                  {t(koala.sex, language)}
                </InfoRow>
                <InfoRow label={`${t('birthDate', language)}:`}>
                  {formatDate(koala.birthDate)}
                </InfoRow>
                <InfoRow label={`${t('age', language)}:`}>
                  {koala.deceased
                    ? (koala.dateOfDeath
                      ? formatAge(koala.birthDate, koala.dateOfDeath)
                      : t('unknown', language))
                    : formatAge(koala.birthDate)}
                </InfoRow>
                <InfoRow label={`${t('detailGeneration', language)}:`}>
                  {language === 'zh' ? `第${generation}代` : `${t('generation', language)} ${generation}`}
                </InfoRow>
                <InfoRow label={`${t('detailStatus', language)}:`}>
                  {koala.deceased ? (
                    <span className="text-gray-500">
                      {t('deceased', language)}
                      {koala.dateOfDeath && ` (${formatDate(koala.dateOfDeath)})`}
                    </span>
                  ) : (
                    <span className="text-green-600">{t('alive', language)}</span>
                  )}
                </InfoRow>
              </div>
            </div>
          </section>

          {/* Family Links */}
          <section>
            <SectionHeader>{t('detailFamily', language)}</SectionHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Parents */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                <p className="text-xs sm:text-sm text-gray-500 font-semibold mb-2">{t('mother', language)} / {t('father', language)}</p>
                <div className="space-y-1.5">
                  <InfoRow label={`${t('mother', language)}:`}>
                    {motherKoala
                      ? <KoalaLink name={motherKoala.name} koalaId={motherKoala.id} onClick={onKoalaClick} />
                      : <span className="text-gray-400">{t('unknown', language)}</span>}
                  </InfoRow>
                  <InfoRow label={`${t('father', language)}:`}>
                    {fatherKoala
                      ? <KoalaLink name={fatherKoala.name} koalaId={fatherKoala.id} onClick={onKoalaClick} />
                      : <span className="text-gray-400">{t('unknown', language)}</span>}
                  </InfoRow>
                </div>
              </div>

              {/* Grandparents */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                <p className="text-xs sm:text-sm text-gray-500 font-semibold mb-2">{t('detailGrandparents', language)}</p>
                {hasGrandparents ? (
                  <div className="space-y-1.5">
                    {(grandparents.maternalGrandmother || motherKoala) && (
                      <InfoRow label={`${t('detailMaternalGrandmother', language)}:`}>
                        {grandparents.maternalGrandmother
                          ? <KoalaLink name={grandparents.maternalGrandmother.name} koalaId={grandparents.maternalGrandmother.id} onClick={onKoalaClick} />
                          : <span className="text-gray-400">{t('unknown', language)}</span>}
                      </InfoRow>
                    )}
                    {(grandparents.maternalGrandfather || motherKoala) && (
                      <InfoRow label={`${t('detailMaternalGrandfather', language)}:`}>
                        {grandparents.maternalGrandfather
                          ? <KoalaLink name={grandparents.maternalGrandfather.name} koalaId={grandparents.maternalGrandfather.id} onClick={onKoalaClick} />
                          : <span className="text-gray-400">{t('unknown', language)}</span>}
                      </InfoRow>
                    )}
                    {(grandparents.paternalGrandmother || fatherKoala) && (
                      <InfoRow label={`${t('detailPaternalGrandmother', language)}:`}>
                        {grandparents.paternalGrandmother
                          ? <KoalaLink name={grandparents.paternalGrandmother.name} koalaId={grandparents.paternalGrandmother.id} onClick={onKoalaClick} />
                          : <span className="text-gray-400">{t('unknown', language)}</span>}
                      </InfoRow>
                    )}
                    {(grandparents.paternalGrandfather || fatherKoala) && (
                      <InfoRow label={`${t('detailPaternalGrandfather', language)}:`}>
                        {grandparents.paternalGrandfather
                          ? <KoalaLink name={grandparents.paternalGrandfather.name} koalaId={grandparents.paternalGrandfather.id} onClick={onKoalaClick} />
                          : <span className="text-gray-400">{t('unknown', language)}</span>}
                      </InfoRow>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">{t('detailNone', language)}</p>
                )}
              </div>

              {/* Mates */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs sm:text-sm text-gray-500 font-semibold mb-2">{t('detailMates', language)}</p>
                {mates.length > 0 ? (
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {mates.map(mate => (
                      <KoalaLink key={mate.id} name={mate.name} koalaId={mate.id} onClick={onKoalaClick} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">{t('detailNoMates', language)}</p>
                )}
              </div>

              {/* Siblings */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs sm:text-sm text-gray-500 font-semibold mb-2">{t('detailSiblings', language)}</p>
                {siblings.full.length === 0 && siblings.half.length === 0 ? (
                  <p className="text-sm text-gray-400">{t('detailNoSiblings', language)}</p>
                ) : (
                  <div className="space-y-2">
                    {siblings.full.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">{t('detailFullSiblings', language)}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {siblings.full.map(s => (
                            <KoalaLink key={s.id} name={s.name} koalaId={s.id} onClick={onKoalaClick} />
                          ))}
                        </div>
                      </div>
                    )}
                    {siblings.half.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">{t('detailHalfSiblings', language)}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {siblings.half.map(s => (
                            <KoalaLink key={s.id} name={s.name} koalaId={s.id} onClick={onKoalaClick} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Offspring */}
          <section>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs sm:text-sm text-gray-500 font-semibold mb-2">
                {t('detailOffspring', language)}
                {offspring.length > 0 && <span className="ml-1 text-gray-400">({offspring.length})</span>}
              </p>
              {offspring.length > 0 ? (
                <div className="space-y-1.5">
                  {offspring.map(child => {
                    const otherParentId = child.mother === koala.id ? child.father : child.mother;
                    const otherParent = otherParentId ? getKoala(otherParentId) : null;
                    return (
                      <div key={child.id} className="flex items-center gap-2 text-sm">
                        <KoalaLink name={child.name} koalaId={child.id} onClick={onKoalaClick} />
                        <span className="text-gray-400 text-xs">
                          {child.sex === 'female' ? '♀' : '♂'}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {child.birthDate ? child.birthDate.split('-')[0] : ''}
                        </span>
                        {otherParent && (
                          <span className="text-gray-400 text-xs ml-auto">
                            × <KoalaLink name={otherParent.name} koalaId={otherParent.id} onClick={onKoalaClick} />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400">{t('detailNoOffspring', language)}</p>
              )}
            </div>
          </section>

          {/* Family Stats */}
          <section>
            <SectionHeader>{t('detailFamilyStats', language)}</SectionHeader>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">{t('detailTotalDescendants', language)}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{familyStats.descendantCount}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">{t('detailTotalAncestors', language)}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{familyStats.ancestorCount}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">{t('detailDeepestDescGen', language)}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">
                  {familyStats.deepestDescGen > 0
                    ? (language === 'zh' ? `第${familyStats.deepestDescGen}代` : `Gen ${familyStats.deepestDescGen}`)
                    : '-'}
                </p>
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section>
            <SectionHeader>{t('detailTimeline', language)}</SectionHeader>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-gray-200" />

                {/* Birth */}
                <div className="relative">
                  <div className="absolute -left-[17px] top-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow" />
                  <p className="text-sm font-semibold text-gray-700">{t('detailBorn', language)}</p>
                  <p className="text-xs text-gray-500">{formatDate(koala.birthDate)}</p>
                </div>

                {/* Current age or death */}
                {koala.deceased ? (
                  <div className="relative">
                    <div className="absolute -left-[17px] top-0.5 w-3 h-3 rounded-full bg-gray-400 border-2 border-white shadow" />
                    <p className="text-sm font-semibold text-gray-700">{t('detailDied', language)}</p>
                    <p className="text-xs text-gray-500">
                      {koala.dateOfDeath ? formatDate(koala.dateOfDeath) : t('unknown', language)}
                    </p>
                    {koala.dateOfDeath && (
                      <p className="text-xs text-gray-400">
                        {t('detailAgeAtDeath', language)}: {formatAge(koala.birthDate, koala.dateOfDeath)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute -left-[17px] top-0.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow animate-pulse" />
                    <p className="text-sm font-semibold text-gray-700">{t('age', language)}</p>
                    <p className="text-xs text-gray-500">{formatAge(koala.birthDate)}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
