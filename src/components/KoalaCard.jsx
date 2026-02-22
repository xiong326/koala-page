import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import { parseKoalaDateString } from '../utils/dateUtils';
import { getAgeForDisplay } from '../utils/ageUtils';

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
    return `${age.value} ${t(age.unit, language)}`;
  };

  return (
    <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-[260px] sm:max-w-md md:max-w-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white border-b border-gray-200">
        <button
          onClick={() => onOpenDetail && onOpenDetail(koala)}
          className="text-xs sm:text-sm font-bold text-gray-800 leading-tight hover:text-blue-600 cursor-pointer text-left truncate min-w-0 flex-1"
        >
          {koala.name}
          <span className="ml-1 text-[10px] sm:text-xs font-normal text-gray-400">
            {koala.sex === 'female' ? '♀' : koala.sex === 'male' ? '♂' : ''}
          </span>
          {koala.deceased && <span className="ml-0.5 text-[10px] sm:text-xs font-normal text-gray-400">†</span>}
        </button>
        <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
          <button
            onClick={() => onOpenDetail && onOpenDetail(koala)}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
            title={t('moreInfo', language)}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
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
        <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-2.5 flex flex-row gap-2 sm:gap-3">
          {/* Photo */}
          <div className="flex-shrink-0">
            {koala.photo ? (
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <img src={koala.photo} alt={koala.name} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-base sm:text-xl md:text-2xl">🐨</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
            {koala.nicknames && koala.nicknames.length > 0 && (
              <div className="text-[9px] sm:text-xs leading-tight">
                <span className="font-semibold text-gray-500">{t('nicknames', language)}:</span>
                <span className="ml-0.5 text-gray-800">{koala.nicknames.join(', ')}</span>
              </div>
            )}

            <div className="text-[9px] sm:text-xs leading-tight">
              <span className="font-semibold text-gray-500">{t('birthDate', language)}:</span>
              <span className="ml-0.5 text-gray-800">{formatDate(koala.birthDate)}</span>
            </div>

            {!koala.deceased && (
              <div className="text-[9px] sm:text-xs leading-tight">
                <span className="font-semibold text-gray-500">{t('age', language)}:</span>
                <span className="ml-0.5 text-gray-800">{formatAge(koala.birthDate)}</span>
              </div>
            )}

            {koala.deceased && (
              <div className="bg-gray-50 p-1 sm:p-1.5 rounded-md border border-gray-200 text-[9px] sm:text-xs leading-tight space-y-0.5">
                <div>
                  <span className="font-semibold text-gray-500">{t('deceased', language)}</span>
                  <span className="ml-0.5 text-gray-400">†</span>
                </div>
                {koala.dateOfDeath && (
                  <div>
                    <span className="font-semibold text-gray-500">{t('dateOfDeath', language)}:</span>
                    <span className="ml-0.5 text-gray-800">{formatDate(koala.dateOfDeath)}</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-gray-500">{t('age', language)}:</span>
                  <span className="ml-0.5 text-gray-800">
                    {koala.dateOfDeath
                      ? formatAge(koala.birthDate, koala.dateOfDeath)
                      : t('unknown', language)}
                  </span>
                </div>
              </div>
            )}

            {(koala.mother || koala.father) && (
              <div className="text-[9px] sm:text-xs leading-tight space-y-0.5">
                <div>
                  <span className="font-semibold text-gray-500">{t('mother', language)}:</span>
                  {koala.mother ? (
                    <button
                      onClick={() => onKoalaClick && onKoalaClick(koala.mother)}
                      className="ml-0.5 font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {getKoalaName(koala.mother)}
                    </button>
                  ) : (
                    <span className="ml-0.5 text-gray-400">{t('unknown', language)}</span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-gray-500">{t('father', language)}:</span>
                  {koala.father ? (
                    <button
                      onClick={() => onKoalaClick && onKoalaClick(koala.father)}
                      className="ml-0.5 font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {getKoalaName(koala.father)}
                    </button>
                  ) : (
                    <span className="ml-0.5 text-gray-400">{t('unknown', language)}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
