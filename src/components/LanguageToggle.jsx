import { useLanguage } from '../i18n/LanguageContext';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
      title="Toggle Language / 切换语言"
    >
      {language === 'en' ? '中文' : 'English'}
    </button>
  );
}
