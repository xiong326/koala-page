import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGeneration } from '../contexts/GenerationContext';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import { GENERATION_METHODS } from '../utils/graphHelpers';

const PAGES = {
  MAIN: 'main',
  LANGUAGE: 'language',
  GENERATION: 'generation',
};

function Checkmark({ selected }) {
  return (
    <span className={`flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-black ${selected ? 'bg-emerald-500 text-white' : 'border border-slate-200 bg-white text-transparent'}`}>
      ✓
    </span>
  );
}

export default function SettingsMenu() {
  const { language, setLanguage } = useLanguage();
  const { generationMethod, setGenerationMethod } = useGeneration();
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(PAGES.MAIN);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (page === PAGES.MAIN) setIsOpen(false);
        else setPage(PAGES.MAIN);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, page]);

  const openSettings = () => {
    setPage(PAGES.MAIN);
    setIsOpen(true);
  };

  const closeSettings = () => {
    setIsOpen(false);
    setPage(PAGES.MAIN);
  };

  const pageTitle = page === PAGES.LANGUAGE
    ? t('settingsLanguage', language)
    : page === PAGES.GENERATION
      ? t('settingsGeneration', language)
      : t('settingsTitle', language);

  return (
    <>
      <button
        type="button"
        onClick={openSettings}
        className="flex h-7 items-center gap-1 rounded border border-white/20 bg-white/14 px-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-white/24 sm:px-2"
        aria-label={t('settingsTitle', language)}
        title={t('settingsTitle', language)}
      >
        <span className="text-sm leading-none" aria-hidden="true">⚙</span>
        <span className="hidden sm:inline">{t('settingsTitle', language)}</span>
      </button>

      {isOpen && createPortal((
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          onClick={closeSettings}
          role="presentation"
        >
          <section
            className="w-full max-w-md overflow-hidden rounded-t-3xl border border-white/80 bg-[#fffdf9] text-slate-800 shadow-2xl sm:rounded-3xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-center gap-2 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-amber-50 px-4 py-3">
              {page !== PAGES.MAIN && (
                <button
                  type="button"
                  onClick={() => setPage(PAGES.MAIN)}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-600 shadow-sm hover:bg-slate-50"
                  aria-label={t('settingsBack', language)}
                >
                  ‹
                </button>
              )}
              <div className="min-w-0 flex-1">
                <h2 id="settings-title" className="truncate text-base font-extrabold text-slate-800 sm:text-lg">{pageTitle}</h2>
                {page === PAGES.MAIN && (
                  <p className="text-xs text-slate-500">{t('settingsSubtitle', language)}</p>
                )}
              </div>
              <button
                type="button"
                onClick={closeSettings}
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xl text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-800"
                aria-label={t('close', language)}
              >
                ×
              </button>
            </header>

            <div className="max-h-[70dvh] overflow-y-auto p-3 sm:p-4">
              {page === PAGES.MAIN && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPage(PAGES.LANGUAGE)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/60"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-xl" aria-hidden="true">🌐</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-slate-800">{t('settingsLanguage', language)}</span>
                      <span className="block truncate text-xs text-slate-500">{language === 'zh' ? '中文' : 'English'}</span>
                    </span>
                    <span className="text-xl text-slate-400" aria-hidden="true">›</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPage(PAGES.GENERATION)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/60"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xl" aria-hidden="true">🌿</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-slate-800">{t('settingsGeneration', language)}</span>
                      <span className="block truncate text-xs text-slate-500">
                        {generationMethod === GENERATION_METHODS.MATERNAL
                          ? t('generationMethodMaternal', language)
                          : t('generationMethodParentsMax', language)}
                      </span>
                    </span>
                    <span className="text-xl text-slate-400" aria-hidden="true">›</span>
                  </button>
                </div>
              )}

              {page === PAGES.LANGUAGE && (
                <div className="space-y-2">
                  {[
                    { value: 'zh', label: '中文', detail: '简体中文' },
                    { value: 'en', label: 'English', detail: 'English' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setLanguage(option.value)}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left shadow-sm ${language === option.value ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                      aria-pressed={language === option.value}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold">{option.label}</span>
                        <span className="block text-xs text-slate-500">{option.detail}</span>
                      </span>
                      <Checkmark selected={language === option.value} />
                    </button>
                  ))}
                </div>
              )}

              {page === PAGES.GENERATION && (
                <div className="space-y-2">
                  {[
                    {
                      value: GENERATION_METHODS.MATERNAL,
                      label: t('generationMethodMaternal', language),
                      detail: t('generationMethodMaternalDescription', language),
                    },
                    {
                      value: GENERATION_METHODS.PARENTS_MAX,
                      label: t('generationMethodParentsMax', language),
                      detail: t('generationMethodParentsMaxDescription', language),
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGenerationMethod(option.value)}
                      className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left shadow-sm ${generationMethod === option.value ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                      aria-pressed={generationMethod === option.value}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold">{option.label}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{option.detail}</span>
                      </span>
                      <Checkmark selected={generationMethod === option.value} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      ), document.body)}
    </>
  );
}
