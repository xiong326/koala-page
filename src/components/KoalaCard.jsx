import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import { parseKoalaDateString } from '../utils/dateUtils';
import { formatAgeForDisplay, getAgeForDisplay } from '../utils/ageUtils';
import { getPhotoUrl } from '../utils/imageUtils';
import TagChips from './TagChips';

export default function KoalaCard({ koala, onClose, allKoalas = [], onKoalaClick, onOpenDetail }) {
  const { language } = useLanguage();

  if (!koala) return null;

  const getKoalaName = (koalaId) => {
    if (!koalaId) return null;
    const foundKoala = allKoalas.find(k => k.id === koalaId);
    return foundKoala ? foundKoala.name : koalaId;
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('unknown', language);

    const locale = language === 'zh' ? 'zh-CN' : 'en-US';

    // Handle partial dates (year only or year-month)
    const parts = dateString.split('-');
    if (parts.length === 1) {
      // Year only: "2023"
      return parts[0];
    } else if (parts.length === 2) {
      // Year-Month: "2023-05"
      const date = parseKoalaDateString(dateString);
      if (!date) return t('unknown', language);
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long'
      });
    } else {
      // Full date: "2023-05-10"
      const date = parseKoalaDateString(dateString);
      if (!date) return t('unknown', language);
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const formatAge = (birthDate, endDate = null) => {
    const age = getAgeForDisplay(birthDate, endDate);
    if (!age) return t('unknown', language);
    return formatAgeForDisplay(age, t, language);
  };

  const sexAccent = koala.sex === 'female'
    ? 'from-pink-500 to-rose-400'
    : koala.sex === 'male'
      ? 'from-blue-500 to-sky-400'
      : 'from-gray-500 to-gray-400';
  const sexPillClass = koala.sex === 'female'
    ? 'bg-pink-50 text-pink-700 ring-pink-100'
    : koala.sex === 'male'
      ? 'bg-blue-50 text-blue-700 ring-blue-100'
      : 'bg-gray-50 text-gray-700 ring-gray-100';

  return (
    <div className="w-[86vw] max-w-[260px] overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-2xl sm:w-full sm:max-w-md md:max-w-lg">
      <div className={`h-1 bg-gradient-to-r ${sexAccent}`} />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-2.5 py-1.5 sm:px-3 sm:py-2">
        <button
          onClick={() => onOpenDetail && onOpenDetail(koala)}
          className="min-w-0 flex-1 cursor-pointer truncate text-left text-xs font-bold leading-tight text-gray-800 hover:text-slate-600 sm:text-sm"
        >
          {koala.name}
          <span className="ml-1 text-[10px] sm:text-xs font-normal text-gray-400">
            {koala.sex === 'female' ? '♀' : koala.sex === 'male' ? '♂' : ''}
          </span>
          {koala.deceased && <span className="ml-0.5 text-[10px] sm:text-xs font-normal text-gray-400">†</span>}
        </button>
        <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-2 sm:p-2.5">
        <div className="flex flex-row gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm sm:gap-3 sm:p-2.5">
          {/* Photo */}
          <div className="flex-shrink-0">
            {koala.photo ? (
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md bg-gray-100 ring-1 ring-gray-200 sm:h-16 sm:w-16 md:h-20 md:w-20">
                <img src={getPhotoUrl(koala.photo, 'thumb')} alt={koala.name} loading="lazy" width={80} height={80} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-md bg-gray-100 ring-1 ring-gray-200 sm:h-16 sm:w-16 md:h-20 md:w-20">
                <span className="text-gray-400 text-base sm:text-xl md:text-2xl">🐨</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1">
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ring-1 sm:text-[10px] ${sexPillClass}`}>
                {t(koala.sex, language)}
              </span>
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ring-1 sm:text-[10px] ${
                koala.deceased
                  ? 'bg-gray-100 text-gray-600 ring-gray-200'
                  : 'bg-green-50 text-green-700 ring-green-100'
              }`}>
                {koala.deceased ? t('deceased', language) : t('alive', language)}
              </span>
            </div>

            <div className="min-h-[18px]">
              <TagChips tags={koala.tags} size="xs" />
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] leading-tight sm:text-xs">
              <div className="min-w-0">
                <p className="font-semibold uppercase tracking-wide text-gray-400">{t('birthDate', language)}</p>
                <p className="min-h-[20px] break-words font-semibold text-gray-800 sm:min-h-[30px]">{formatDate(koala.birthDate)}</p>
              </div>
              <div className="min-w-0">
                <p className="font-semibold uppercase tracking-wide text-gray-400">{t('age', language)}</p>
                <p className="min-h-[20px] truncate font-semibold text-gray-800 sm:min-h-[30px]">
                  {koala.deceased
                    ? (koala.dateOfDeath ? formatAge(koala.birthDate, koala.dateOfDeath) : t('unknown', language))
                    : formatAge(koala.birthDate)}
                </p>
              </div>
              <div className="col-span-2 min-w-0">
                <p className="font-semibold uppercase tracking-wide text-gray-400">
                  {koala.deceased ? t('dateOfDeath', language) : t('detailStatus', language)}
                </p>
                <p className={koala.deceased ? 'truncate font-semibold text-gray-700' : 'truncate font-semibold text-green-600'}>
                  {koala.deceased
                    ? (koala.dateOfDeath ? formatDate(koala.dateOfDeath) : t('unknown', language))
                    : t('alive', language)}
                </p>
              </div>
            </div>

            <div className="space-y-0.5 border-t border-gray-100 pt-1 text-[9px] leading-tight sm:text-xs">
              <div className="flex min-w-0 items-center">
                <span className="shrink-0 font-semibold text-gray-500">{t('mother', language)}:</span>
                {koala.mother ? (
                  <button
                    onClick={() => onKoalaClick && onKoalaClick(koala.mother)}
                    className="ml-1 inline-flex min-w-0 items-center gap-0.5 truncate rounded border border-slate-200 bg-slate-50 px-1 py-0.5 font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <span className="truncate">{getKoalaName(koala.mother)}</span>
                    <span aria-hidden="true" className="text-[9px] leading-none text-slate-400">›</span>
                  </button>
                ) : (
                  <span className="ml-0.5 truncate text-gray-400">{t('unknown', language)}</span>
                )}
              </div>
              <div className="flex min-w-0 items-center">
                <span className="shrink-0 font-semibold text-gray-500">{t('father', language)}:</span>
                {koala.father ? (
                  <button
                    onClick={() => onKoalaClick && onKoalaClick(koala.father)}
                    className="ml-1 inline-flex min-w-0 items-center gap-0.5 truncate rounded border border-slate-200 bg-slate-50 px-1 py-0.5 font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <span className="truncate">{getKoalaName(koala.father)}</span>
                    <span aria-hidden="true" className="text-[9px] leading-none text-slate-400">›</span>
                  </button>
                ) : (
                  <span className="ml-0.5 truncate text-gray-400">{t('unknown', language)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenDetail && onOpenDetail(koala)}
          className={`mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-md bg-gradient-to-r px-2 py-1 text-[11px] font-bold text-white shadow-sm transition-opacity hover:opacity-90 sm:mt-2 sm:py-1.5 sm:text-xs ${sexAccent}`}
        >
          {t('viewFullProfile', language)}
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
