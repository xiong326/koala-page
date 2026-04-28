import { useMemo, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import { parseKoalaDateString } from '../utils/dateUtils';
import { getAgeForDisplay } from '../utils/ageUtils';
import { getDescendants, getAncestors, calculateGeneration } from '../utils/graphHelpers';
import { getPhotoUrl } from '../utils/imageUtils';
import KoalaEditForm from './KoalaEditForm';
import TagChips from './TagChips';
import * as api from '../api/koalaApi';

function KoalaLink({ name, koalaId, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(koalaId)}
      className="cursor-pointer text-left text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline sm:text-sm"
    >
      {name}
    </button>
  );
}

function SectionHeader({ children }) {
  return (
    <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 sm:mb-3 sm:text-sm sm:text-gray-600">{children}</h3>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="grid grid-cols-[58px_minmax(0,1fr)] items-start gap-x-1.5 text-xs sm:grid-cols-[100px_1fr] sm:gap-x-2 sm:text-sm">
      <span className="min-w-0 font-semibold text-gray-500">{label}</span>
      <span className="min-w-0 break-words text-gray-800">{children}</span>
    </div>
  );
}

export default function KoalaDetailModal({ koala, allKoalas, onClose, onKoalaClick, isAuthenticated, onKoalaUpdated, onKoalaDeleted, currentBoard }) {
  const { language } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
  const sexAccent = koala.sex === 'female'
    ? 'from-pink-500 to-rose-400'
    : koala.sex === 'male'
      ? 'from-blue-500 to-sky-400'
      : 'from-gray-500 to-gray-400';

  const handleNav = (targetKoala) => {
    if (targetKoala && onKoalaClick) {
      setEditing(false);
      onKoalaClick(targetKoala.id);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteKoala(koala.id);
      if (onKoalaDeleted) onKoalaDeleted();
    } catch {
      setDeleting(false);
    }
  };

  if (!koala) return null;

  if (editing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditing(false)}>
        <div className="max-h-[92dvh] w-[96vw] max-w-2xl overflow-y-auto rounded-lg bg-white p-3 shadow-2xl sm:max-h-[85vh] sm:w-[90vw] sm:rounded-xl sm:p-6" onClick={e => e.stopPropagation()}>
          <h2 className="mb-3 text-base font-bold text-gray-800 sm:mb-4 sm:text-lg">{t('editEdit', language)}: {koala.name}</h2>
          <KoalaEditForm
            koala={koala}
            board={currentBoard}
            allKoalas={allKoalas}
            onSave={(updated) => {
              setEditing(false);
              if (onKoalaUpdated) onKoalaUpdated(updated);
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 sm:px-0 sm:py-0" onClick={onClose}>
      <div
        className="flex max-h-[82dvh] w-[88vw] max-w-3xl flex-col overflow-hidden rounded-lg bg-gray-50 shadow-2xl sm:max-h-[85vh] sm:w-[90vw] sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Delete confirmation */}
        {deleting && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/30 sm:rounded-xl">
            <div className="mx-4 max-w-sm rounded-lg bg-white p-4 shadow-xl sm:p-6">
              <p className="mb-4 text-sm text-gray-700">{t('editDeleteConfirm', language, { name: koala.name })}</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeleting(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800">{t('cancel', language)}</button>
                <button onClick={handleDelete} className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600">{t('editDelete', language)}</button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white p-2.5 sm:p-5">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={() => handleNav(prevKoala)}
              disabled={!prevKoala}
              className="flex-shrink-0 rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-30"
              title={t('detailPrev', language)}
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-bold text-gray-800 sm:text-xl">
                {koala.name}
                <span className="ml-1 text-sm font-normal text-gray-400 sm:ml-1.5 sm:text-base">
                  {koala.sex === 'female' ? '♀' : koala.sex === 'male' ? '♂' : ''}
                </span>
                {koala.deceased && <span className="ml-1 text-sm font-normal text-gray-400 sm:text-base">†</span>}
              </h2>
              <TagChips tags={koala.tags} size="xs" className="mt-0.5" />
            </div>
            <button
              type="button"
              onClick={() => handleNav(nextKoala)}
              disabled={!nextKoala}
              className="flex-shrink-0 rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-30"
              title={t('detailNext', language)}
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="ml-1.5 flex flex-shrink-0 items-center gap-0.5 sm:ml-3 sm:gap-1">
            {isAuthenticated && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="p-1.5 rounded-md hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition-colors"
                  title={t('editEdit', language)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => setDeleting(true)}
                  className="p-1.5 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                  title={t('editDelete', language)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 space-y-3 overflow-y-auto p-2.5 sm:space-y-6 sm:p-5">

          {/* Photo + Basic Info row */}
          <section>
            <SectionHeader>{t('detailBasicInfo', language)}</SectionHeader>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className={`h-1 bg-gradient-to-r ${sexAccent}`} />
              <div className="flex gap-2 p-2.5 sm:gap-4 sm:p-4">
                <div className="flex-shrink-0">
                  {koala.photo ? (
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md bg-gray-100 ring-1 ring-gray-200 sm:h-28 sm:w-28 sm:rounded-lg">
                      <img src={getPhotoUrl(koala.photo, 'medium')} alt={koala.name} loading="lazy" width={128} height={128} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-100 ring-1 ring-gray-200 sm:h-28 sm:w-28 sm:rounded-lg">
                      <span className="text-2xl text-gray-400 sm:text-4xl">🐨</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 sm:text-xs ${
                      koala.sex === 'female'
                        ? 'bg-pink-50 text-pink-700 ring-pink-100'
                        : koala.sex === 'male'
                          ? 'bg-blue-50 text-blue-700 ring-blue-100'
                          : 'bg-gray-50 text-gray-700 ring-gray-100'
                    }`}>
                      {t(koala.sex, language)}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 sm:text-xs ${
                      koala.deceased
                        ? 'bg-gray-100 text-gray-600 ring-gray-200'
                        : 'bg-green-50 text-green-700 ring-green-100'
                    }`}>
                      {koala.deceased ? t('deceased', language) : t('alive', language)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs sm:text-sm">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 sm:text-xs">{t('birthDate', language)}</p>
                      <p className="break-words font-semibold text-gray-800">{formatDate(koala.birthDate)}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 sm:text-xs">{t('age', language)}</p>
                      <p className="font-semibold text-gray-800">
                        {koala.deceased
                          ? (koala.dateOfDeath
                            ? formatAge(koala.birthDate, koala.dateOfDeath)
                            : t('unknown', language))
                          : formatAge(koala.birthDate)}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 sm:text-xs">{t('detailGeneration', language)}</p>
                      <p className="font-semibold text-gray-800">
                        {language === 'zh' ? `第${generation}代` : `${t('generation', language)} ${generation}`}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 sm:text-xs">
                        {koala.deceased ? t('dateOfDeath', language) : t('detailStatus', language)}
                      </p>
                      <p className={koala.deceased ? 'break-words font-semibold text-gray-600' : 'font-semibold text-green-600'}>
                        {koala.deceased && koala.dateOfDeath ? formatDate(koala.dateOfDeath) : (koala.deceased ? t('unknown', language) : t('alive', language))}
                      </p>
                    </div>
                  </div>
                  <TagChips tags={koala.tags} className="mt-2" />
                </div>
              </div>
            </div>
          </section>

          {/* Family Links */}
          <section>
            <SectionHeader>{t('detailFamily', language)}</SectionHeader>
            <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-2">

              {/* Parents */}
              <div className="space-y-1.5 rounded-lg border border-gray-200 bg-white p-2.5 sm:space-y-2 sm:p-4">
                <p className="mb-1.5 text-xs font-semibold text-gray-500 sm:mb-2 sm:text-sm">{t('mother', language)} / {t('father', language)}</p>
                <div className="space-y-1 sm:space-y-1.5">
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
              <div className="space-y-1.5 rounded-lg border border-gray-200 bg-white p-2.5 sm:space-y-2 sm:p-4">
                <p className="mb-1.5 text-xs font-semibold text-gray-500 sm:mb-2 sm:text-sm">{t('detailGrandparents', language)}</p>
                {hasGrandparents ? (
                  <div className="space-y-1 sm:space-y-1.5">
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
                  <p className="text-xs text-gray-400 sm:text-sm">{t('detailNone', language)}</p>
                )}
              </div>

              {/* Mates */}
              <div className="rounded-lg border border-gray-200 bg-white p-2.5 sm:p-4">
                <p className="mb-1.5 text-xs font-semibold text-gray-500 sm:mb-2 sm:text-sm">{t('detailMates', language)}</p>
                {mates.length > 0 ? (
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 sm:gap-x-3 sm:gap-y-1">
                    {mates.map(mate => (
                      <KoalaLink key={mate.id} name={mate.name} koalaId={mate.id} onClick={onKoalaClick} />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 sm:text-sm">{t('detailNoMates', language)}</p>
                )}
              </div>

              {/* Siblings */}
              <div className="rounded-lg border border-gray-200 bg-white p-2.5 sm:p-4">
                <p className="mb-1.5 text-xs font-semibold text-gray-500 sm:mb-2 sm:text-sm">{t('detailSiblings', language)}</p>
                {siblings.full.length === 0 && siblings.half.length === 0 ? (
                  <p className="text-xs text-gray-400 sm:text-sm">{t('detailNoSiblings', language)}</p>
                ) : (
                  <div className="space-y-1.5 sm:space-y-2">
                    {siblings.full.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">{t('detailFullSiblings', language)}</p>
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 sm:gap-x-3 sm:gap-y-1">
                          {siblings.full.map(s => (
                            <KoalaLink key={s.id} name={s.name} koalaId={s.id} onClick={onKoalaClick} />
                          ))}
                        </div>
                      </div>
                    )}
                    {siblings.half.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">{t('detailHalfSiblings', language)}</p>
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 sm:gap-x-3 sm:gap-y-1">
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
            <div className="rounded-lg border border-gray-200 bg-white p-2.5 sm:p-4">
              <p className="mb-1.5 text-xs font-semibold text-gray-500 sm:mb-2 sm:text-sm">
                {t('detailOffspring', language)}
                {offspring.length > 0 && <span className="ml-1 text-gray-400">({offspring.length})</span>}
              </p>
              {offspring.length > 0 ? (
                <div className="space-y-1 sm:space-y-1.5">
                  {offspring.map(child => {
                    const otherParentId = child.mother === koala.id ? child.father : child.mother;
                    const otherParent = otherParentId ? getKoala(otherParentId) : null;
                    return (
                      <div key={child.id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm">
                        <KoalaLink name={child.name} koalaId={child.id} onClick={onKoalaClick} />
                        <span className="text-gray-400 text-xs">
                          {child.sex === 'female' ? '♀' : '♂'}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {child.birthDate ? child.birthDate.split('-')[0] : ''}
                        </span>
                        {otherParent && (
                          <span className="text-xs text-gray-400 sm:ml-auto">
                            × <KoalaLink name={otherParent.name} koalaId={otherParent.id} onClick={onKoalaClick} />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400 sm:text-sm">{t('detailNoOffspring', language)}</p>
              )}
            </div>
          </section>

          {/* Family Stats */}
          <section>
            <SectionHeader>{t('detailFamilyStats', language)}</SectionHeader>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
              <div className="rounded-lg border border-gray-200 bg-white p-2 sm:p-4">
                <p className="mb-1 text-[10px] leading-tight text-gray-500 sm:text-sm">{t('detailTotalDescendants', language)}</p>
                <p className="text-lg font-bold text-gray-800 sm:text-2xl">{familyStats.descendantCount}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-2 sm:p-4">
                <p className="mb-1 text-[10px] leading-tight text-gray-500 sm:text-sm">{t('detailTotalAncestors', language)}</p>
                <p className="text-lg font-bold text-gray-800 sm:text-2xl">{familyStats.ancestorCount}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-2 sm:p-4">
                <p className="mb-1 text-[10px] leading-tight text-gray-500 sm:text-sm">{t('detailDeepestDescGen', language)}</p>
                <p className="text-lg font-bold text-gray-800 sm:text-2xl">
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
            <div className="rounded-lg border border-gray-200 bg-white p-2.5 sm:p-4">
              <div className="relative space-y-3 pl-5 sm:space-y-4 sm:pl-6">
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
