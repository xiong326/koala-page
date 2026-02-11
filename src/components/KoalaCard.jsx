import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import { parseKoalaDateString } from '../utils/dateUtils';
import { getAgeForDisplay } from '../utils/ageUtils';

export default function KoalaCard({ koala, onClose, allKoalas = [], onKoalaClick }) {
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
    <div className="bg-white rounded shadow-lg p-1.5 sm:p-3 flex flex-row gap-1.5 sm:gap-3 w-full max-w-[240px] sm:max-w-lg md:max-w-2xl">
      {/* Photo - left side on all screens */}
      <div className="flex-shrink-0">
        {koala.photo ? (
          <div className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
            <img
              src={koala.photo}
              alt={koala.name}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-400 text-base sm:text-2xl md:text-3xl">🐨</span>
          </div>
        )}
      </div>

      {/* Information - below photo on mobile, right on larger screens */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1 sm:mb-1.5">
          <h2 className="text-[11px] sm:text-sm md:text-base font-bold text-gray-800 leading-tight">{koala.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-base sm:text-base md:text-lg font-bold leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-0.5 sm:space-y-1">
        {koala.nicknames && koala.nicknames.length > 0 && (
          <div className="text-[9px] sm:text-xs leading-tight">
            <span className="font-semibold text-gray-700">{t('nicknames', language)}:</span>
            <span className="ml-0.5 text-gray-600">{koala.nicknames.join(', ')}</span>
          </div>
        )}

        <div className="text-[9px] sm:text-xs leading-tight">
          <span className="font-semibold text-gray-700">{t('sex', language)}:</span>
          <span className="ml-0.5 text-gray-600 capitalize">{t(koala.sex, language)}</span>
        </div>

        <div className="text-[9px] sm:text-xs leading-tight">
          <span className="font-semibold text-gray-700">{t('birthDate', language)}:</span>
          <span className="ml-0.5 text-gray-600">{formatDate(koala.birthDate)}</span>
        </div>

        {!koala.deceased && (
          <div className="text-[9px] sm:text-xs leading-tight">
            <span className="font-semibold text-gray-700">{t('age', language)}:</span>
            <span className="ml-0.5 text-gray-600">{formatAge(koala.birthDate)}</span>
          </div>
        )}

        {koala.deceased && (
          <div className="bg-gray-100 p-1 sm:p-1.5 rounded border-l-2 border-gray-500 text-[9px] sm:text-xs leading-tight space-y-0.5">
            <div>
              <span className="font-semibold text-gray-700">{t('deceased', language)}</span>
              <span className="ml-0.5 text-gray-600">†</span>
            </div>
            {koala.dateOfDeath && (
              <div>
                <span className="font-semibold text-gray-700">{t('dateOfDeath', language)}:</span>
                <span className="ml-0.5 text-gray-600">{formatDate(koala.dateOfDeath)}</span>
              </div>
            )}
            <div>
              <span className="font-semibold text-gray-700">{t('age', language)}:</span>
              <span className="ml-0.5 text-gray-600">
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
              <span className="font-semibold text-gray-700">{t('mother', language)}:</span>
              {koala.mother ? (
                <button
                  onClick={() => onKoalaClick && onKoalaClick(koala.mother)}
                  className="ml-0.5 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  {getKoalaName(koala.mother)}
                </button>
              ) : (
                <span className="ml-0.5 text-gray-600">{t('unknown', language)}</span>
              )}
            </div>
            <div>
              <span className="font-semibold text-gray-700">{t('father', language)}:</span>
              {koala.father ? (
                <button
                  onClick={() => onKoalaClick && onKoalaClick(koala.father)}
                  className="ml-0.5 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  {getKoalaName(koala.father)}
                </button>
              ) : (
                <span className="ml-0.5 text-gray-600">{t('unknown', language)}</span>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
