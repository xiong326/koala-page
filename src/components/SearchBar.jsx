import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';

export default function SearchBar({ value, onChange, onClear }) {
  const { language } = useLanguage();

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('searchPlaceholder', language)}
        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      )}
    </div>
  );
}
