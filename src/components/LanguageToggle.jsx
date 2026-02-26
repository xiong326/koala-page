import { useLanguage } from '../i18n/LanguageContext';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="px-2 py-0.5 h-7 bg-white/20 hover:bg-white/30 rounded text-white text-xs font-medium transition-colors"
      title="Toggle Language / 切换语言"
    >
      {language === 'en' ? '中文' : 'English'}
    </button>
  );
}
