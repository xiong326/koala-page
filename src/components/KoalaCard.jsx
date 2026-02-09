import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';

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
      const date = new Date(dateString + '-01');
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long'
      });
    } else {
      // Full date: "2023-05-10"
      const date = new Date(dateString);
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const calculateAge = (birthDate, endDate = null) => {
    if (!birthDate) return t('unknown', language);

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

    const years = end.getFullYear() - birth.getFullYear() - 1;
    const months = end.getMonth() - birth.getMonth();

    if (years === 0) {
      const monthCount = months + (end.getMonth() < birth.getMonth() ? 12 : 0);
      return `${monthCount} ${t('months', language)}`;
    }
    return `${years} ${t('years', language)}`;
  };

  return (
    <div className="bg-white rounded shadow-lg p-3 text-xs">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-sm font-bold text-gray-800">{koala.name}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-base font-bold ml-2 -mt-1"
        >
          ×
        </button>
      </div>

      <div className="space-y-1">
        {koala.photo ? (
          <div className="w-full h-32 bg-gray-100 rounded overflow-hidden mb-1 flex items-center justify-center">
            <img
              src={koala.photo}
              alt={koala.name}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center mb-1">
            <span className="text-gray-400 text-2xl">🐨</span>
          </div>
        )}

        {koala.nicknames && koala.nicknames.length > 0 && (
          <div>
            <span className="font-semibold text-gray-700">{t('nicknames', language)}:</span>
            <span className="ml-1 text-gray-600">{koala.nicknames.join(', ')}</span>
          </div>
        )}

        <div>
          <span className="font-semibold text-gray-700">{t('sex', language)}:</span>
          <span className="ml-1 text-gray-600 capitalize">{t(koala.sex, language)}</span>
        </div>

        <div>
          <span className="font-semibold text-gray-700">{t('birthDate', language)}:</span>
          <span className="ml-1 text-gray-600">{formatDate(koala.birthDate)}</span>
        </div>

        {!koala.deceased && (
          <div>
            <span className="font-semibold text-gray-700">{t('age', language)}:</span>
            <span className="ml-1 text-gray-600">{calculateAge(koala.birthDate)}</span>
          </div>
        )}

        {koala.deceased && (
          <div className="bg-gray-100 p-1.5 rounded border-l-2 border-gray-500">
            <div>
              <span className="font-semibold text-gray-700">{t('deceased', language)}</span>
              <span className="ml-1 text-gray-600">†</span>
            </div>
            {koala.dateOfDeath && (
              <div>
                <span className="font-semibold text-gray-700">{t('dateOfDeath', language)}:</span>
                <span className="ml-1 text-gray-600">{formatDate(koala.dateOfDeath)}</span>
              </div>
            )}
            <div>
              <span className="font-semibold text-gray-700">{t('age', language)}:</span>
              <span className="ml-1 text-gray-600">
                {koala.dateOfDeath
                  ? calculateAge(koala.birthDate, koala.dateOfDeath)
                  : t('unknown', language)}
              </span>
            </div>
          </div>
        )}

        {(koala.mother || koala.father) && (
          <div>
            <span className="font-semibold text-gray-700">{t('mother', language)}:</span>
            {koala.mother ? (
              <button
                onClick={() => onKoalaClick && onKoalaClick(koala.mother)}
                className="ml-1 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                {getKoalaName(koala.mother)}
              </button>
            ) : (
              <span className="ml-1 text-gray-600">{t('unknown', language)}</span>
            )}
            <div>
              <span className="font-semibold text-gray-700">{t('father', language)}:</span>
              {koala.father ? (
                <button
                  onClick={() => onKoalaClick && onKoalaClick(koala.father)}
                  className="ml-1 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  {getKoalaName(koala.father)}
                </button>
              ) : (
                <span className="ml-1 text-gray-600">{t('unknown', language)}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
