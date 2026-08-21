import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';

const WEEKDAYS = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  zh: ['日', '一', '二', '三', '四', '五', '六'],
};

function sameDate(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export default function BirthdayCalendar({ koalas, isOpen, onClose, onKoalaClick }) {
  const { language } = useLanguage();
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const birthdaysByDay = useMemo(() => {
    const result = new Map();
    const visibleYear = visibleMonth.getFullYear();
    koalas.forEach((koala) => {
      if (koala.deceased || !/^\d{4}-\d{2}-\d{2}$/.test(koala.birthDate || '')) return;
      const [birthYear, month, day] = koala.birthDate.split('-').map(Number);
      const age = visibleYear - birthYear;
      if (month !== visibleMonth.getMonth() + 1 || age < 0) return;
      if (!result.has(day)) result.set(day, []);
      result.get(day).push({ koala, age });
    });
    result.forEach((items) => items.sort((a, b) => a.koala.name.localeCompare(b.koala.name, language === 'zh' ? 'zh-CN' : 'en')));
    return result;
  }, [koalas, language, visibleMonth]);

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const leadingBlanks = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [
      ...Array.from({ length: leadingBlanks }, (_, index) => ({ key: `blank-${index}` })),
      ...Array.from({ length: daysInMonth }, (_, index) => ({
        key: `day-${index + 1}`,
        day: index + 1,
        date: new Date(year, month, index + 1),
      })),
    ];
  }, [visibleMonth]);

  if (!isOpen) return null;

  const today = new Date();
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
  const monthTitle = visibleMonth.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
  const todayText = today.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });

  const changeMonth = (offset) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-rose-950/45 p-2 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <section
        className="flex max-h-[94dvh] w-full max-w-4xl flex-col overflow-hidden rounded-[1.4rem] border-2 border-white/80 bg-[#fffdf9] shadow-[0_24px_80px_rgba(76,29,46,0.3)] sm:rounded-[2rem]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="birthday-calendar-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="relative flex shrink-0 items-start justify-between gap-3 overflow-hidden border-b border-rose-100 bg-gradient-to-r from-rose-100 via-amber-50 to-emerald-100 px-3 py-3 sm:px-5 sm:py-4">
          <span aria-hidden="true" className="absolute -left-2 -top-3 text-4xl opacity-20 sm:text-5xl">🎈</span>
          <span aria-hidden="true" className="absolute bottom-0 right-14 text-3xl opacity-20 sm:right-20 sm:text-4xl">🎉</span>
          <div className="relative min-w-0">
            <h2 id="birthday-calendar-title" className="flex items-center gap-2 text-base font-extrabold text-rose-950 sm:text-xl">
              <span aria-hidden="true" className="text-xl sm:text-2xl">🎂</span>
              {t('birthdayCalendarTitle', language)}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] sm:gap-2 sm:text-sm">
              <span className="rounded-full bg-white/80 px-2 py-0.5 font-semibold text-rose-700 shadow-sm ring-1 ring-rose-100">
                {t('birthdayCalendarToday', language, { date: todayText })}
              </span>
              <span className="hidden text-rose-800/65 sm:inline">{t('birthdayCalendarSubtitle', language)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="relative flex size-9 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-white/90 text-xl text-rose-500 shadow-sm transition-transform hover:rotate-6 hover:bg-white hover:text-rose-700"
            aria-label={t('close', language)}
          >
            ×
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col bg-[radial-gradient(circle_at_10%_10%,rgba(251,207,232,0.18),transparent_24%),radial-gradient(circle_at_90%_90%,rgba(167,243,208,0.18),transparent_26%)] p-2 sm:p-5">
          <div className="mb-2 flex shrink-0 items-center justify-between gap-2 sm:mb-4">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-bold text-rose-700 shadow-sm transition-transform hover:-translate-x-0.5 hover:bg-rose-100"
              aria-label={t('birthdayCalendarPreviousMonth', language)}
            >
              ‹ <span className="hidden sm:inline">{t('birthdayCalendarPreviousMonth', language)}</span>
            </button>
            <h3 className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-slate-800 shadow-sm ring-1 ring-amber-100 sm:text-lg">
              <span aria-hidden="true">🌼 </span>{monthTitle}
            </h3>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700 shadow-sm transition-transform hover:translate-x-0.5 hover:bg-emerald-100"
              aria-label={t('birthdayCalendarNextMonth', language)}
            >
              <span className="hidden sm:inline">{t('birthdayCalendarNextMonth', language)}</span> ›
            </button>
          </div>

          <div className="grid shrink-0 grid-cols-7 px-1">
            {WEEKDAYS[language].map((weekday) => (
              <div key={weekday} className="py-1.5 text-center text-[10px] font-extrabold uppercase text-rose-400 sm:text-xs">
                {weekday}
              </div>
            ))}
          </div>
          <div className="grid min-h-0 flex-1 auto-rows-max content-start grid-cols-7 gap-1 overflow-y-auto rounded-xl bg-gradient-to-br from-rose-100/80 via-amber-100/70 to-emerald-100/80 p-1 sm:gap-1.5 sm:rounded-2xl sm:p-1.5">
            {calendarDays.map(({ key, day, date }) => {
              if (!day) return <div key={key} className="min-h-14 rounded-lg bg-white/35 sm:min-h-16 sm:rounded-xl" />;
              const birthdays = birthdaysByDay.get(day) || [];
              const isToday = sameDate(date, today);
              return (
                <div
                  key={key}
                  className={`min-h-14 rounded-lg p-1 shadow-sm sm:min-h-16 sm:rounded-xl sm:p-1.5 ${isToday ? 'bg-amber-50 ring-2 ring-inset ring-amber-400' : birthdays.length > 0 ? 'bg-white' : 'bg-white/75'}`}
                >
                  <div className="mb-0.5 flex items-center justify-between gap-1">
                    <span className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold sm:size-6 sm:text-xs ${isToday ? 'bg-amber-500 text-white' : 'text-slate-600'}`}>
                      {day}
                    </span>
                    {birthdays.length > 0 && <span aria-hidden="true" className="animate-pulse text-[10px] sm:text-xs">🎂</span>}
                  </div>
                  <div className="space-y-0.5">
                    {birthdays.map(({ koala, age }, index) => (
                      <button
                        key={koala.id}
                        type="button"
                        onClick={() => onKoalaClick(koala)}
                        className={`block w-full overflow-hidden rounded-md px-1 py-0.5 text-left leading-tight shadow-sm transition-transform hover:-translate-y-px focus:outline-none focus:ring-2 sm:flex sm:items-center sm:justify-between sm:gap-1 sm:rounded-lg sm:px-1.5 sm:py-1 ${index % 3 === 0 ? 'bg-rose-100 text-rose-900 hover:bg-rose-200 focus:ring-rose-400' : index % 3 === 1 ? 'bg-sky-100 text-sky-900 hover:bg-sky-200 focus:ring-sky-400' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 focus:ring-emerald-400'}`}
                        title={`${koala.name} · ${t('birthdayCalendarAge', language, { age })}`}
                      >
                        <span className="block min-w-0 truncate text-[10px] font-extrabold sm:text-xs">{koala.name}</span>
                        <span className="block truncate text-[9px] font-semibold opacity-75 sm:shrink-0 sm:text-[10px]">
                          {t('birthdayCalendarAge', language, { age })}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
