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

  const monthOnlyBirthdays = useMemo(() => {
    const visibleYear = visibleMonth.getFullYear();
    const visibleMonthNumber = visibleMonth.getMonth() + 1;
    return koalas
      .filter((koala) => {
        if (koala.deceased || !/^\d{4}-\d{2}$/.test(koala.birthDate || '')) return false;
        const [birthYear, birthMonth] = koala.birthDate.split('-').map(Number);
        return birthMonth === visibleMonthNumber && birthYear <= visibleYear;
      })
      .map((koala) => ({
        koala,
        age: visibleYear - Number(koala.birthDate.slice(0, 4)),
      }))
      .sort((a, b) => a.koala.name.localeCompare(b.koala.name, language === 'zh' ? 'zh-CN' : 'en'));
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
      className="forest-skin fixed inset-0 z-[60] flex items-center justify-center bg-[#344438]/45 p-2 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <section
        className="forest-modal flex max-h-[94dvh] w-full max-w-4xl flex-col overflow-hidden bg-[#fffdf9]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="birthday-calendar-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="relative flex shrink-0 items-start justify-between gap-3 overflow-hidden border-b-2 border-[#d8cfb8] bg-[#e4ecd7] px-3 py-3 sm:px-5 sm:py-4">
          <span aria-hidden="true" className="absolute -left-2 -top-3 text-4xl opacity-20 sm:text-5xl">🌿</span>
          <span aria-hidden="true" className="absolute bottom-0 right-14 text-3xl opacity-20 sm:right-20 sm:text-4xl">🐨</span>
          <div className="relative min-w-0">
            <h2 id="birthday-calendar-title" className="flex items-center gap-2 text-base font-extrabold text-[#344438] sm:text-xl">
              <span aria-hidden="true" className="text-xl sm:text-2xl">🎂</span>
              {t('birthdayCalendarTitle', language)}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] sm:gap-2 sm:text-sm">
              <span className="rounded-full bg-[#fffdf4] px-2 py-0.5 font-semibold text-[#557b5f] shadow-sm ring-1 ring-[#c3d0b6]">
                {t('birthdayCalendarToday', language, { date: todayText })}
              </span>
              <span className="hidden text-[#718073] sm:inline">{t('birthdayCalendarSubtitle', language)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="relative flex size-9 shrink-0 items-center justify-center rounded-full border border-[#cbbd9e] bg-[#fffdf4] text-xl text-[#8a6947] shadow-sm transition-transform hover:rotate-6 hover:bg-[#f4eedc] hover:text-[#684c31]"
            aria-label={t('close', language)}
          >
            ×
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col bg-[#fffdf4] p-2 sm:p-5">
          <div className="mb-2 flex shrink-0 items-center justify-between gap-2 sm:mb-4">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="rounded-full border border-[#cbbd9e] bg-[#f8f3e4] px-3 py-1.5 text-sm font-bold text-[#557b5f] shadow-sm transition-transform hover:-translate-x-0.5 hover:bg-[#eee8d4]"
              aria-label={t('birthdayCalendarPreviousMonth', language)}
            >
              ‹ <span className="hidden sm:inline">{t('birthdayCalendarPreviousMonth', language)}</span>
            </button>
            <h3 className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-slate-800 shadow-sm ring-1 ring-[#c3d0b6] sm:text-lg">
              <span aria-hidden="true">🌿 </span>{monthTitle}
            </h3>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="rounded-full border border-[#afc3a3] bg-[#e7efdc] px-3 py-1.5 text-sm font-bold text-[#42614d] shadow-sm transition-transform hover:translate-x-0.5 hover:bg-[#dce8ce]"
              aria-label={t('birthdayCalendarNextMonth', language)}
            >
              <span className="hidden sm:inline">{t('birthdayCalendarNextMonth', language)}</span> ›
            </button>
          </div>

          {monthOnlyBirthdays.length > 0 && (
            <section className="mb-2 shrink-0 rounded-xl border border-[#c3d0b6] bg-[#edf2e4] p-2 sm:mb-3 sm:rounded-2xl sm:p-3" aria-labelledby="month-only-birthdays-title">
              <div className="mb-1.5 flex items-center gap-2 sm:mb-2">
                <span aria-hidden="true" className="text-base sm:text-lg">🌿</span>
                <div className="min-w-0">
                  <h4 id="month-only-birthdays-title" className="text-xs font-extrabold text-[#42614d] sm:text-sm">
                    {t('birthdayCalendarMonthOnlyTitle', language)}
                  </h4>
                  <p className="text-[9px] font-semibold text-[#718073] sm:text-[11px]">
                    {t('birthdayCalendarMonthOnlyHint', language)}
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 sm:flex-wrap sm:overflow-visible">
                {monthOnlyBirthdays.map(({ koala, age }) => (
                  <button
                    key={koala.id}
                    type="button"
                    onClick={() => onKoalaClick(koala)}
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-1.5 text-left shadow-sm ring-1 transition-transform hover:-translate-y-px focus:outline-none focus:ring-2 ${koala.sex === 'female' ? 'bg-[#f6e2e5] text-[#8a4051] ring-[#dcb1ba] focus:ring-[#c7818d]' : koala.sex === 'male' ? 'bg-[#e0ebef] text-[#2f667f] ring-[#a9c4cf] focus:ring-[#4c7f97]' : 'bg-[#eee9dc] text-[#665f52] ring-[#d1c8b2] focus:ring-[#8b8b7a]'}`}
                    title={`${koala.name} · ${t('birthdayCalendarMonthUnknown', language)} · ${t('birthdayCalendarAge', language, { age })}`}
                  >
                    <span className="font-extrabold text-[11px] sm:text-xs">{koala.name}</span>
                    <span className="text-[9px] font-bold opacity-75 sm:text-[10px]">{t('birthdayCalendarAge', language, { age })}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="grid shrink-0 grid-cols-7 px-1">
            {WEEKDAYS[language].map((weekday) => (
              <div key={weekday} className="py-1.5 text-center text-[10px] font-extrabold uppercase text-[#6f8a70] sm:text-xs">
                {weekday}
              </div>
            ))}
          </div>
          <div className="forest-calendar-grid grid min-h-0 flex-1 auto-rows-max content-start grid-cols-7 gap-1 overflow-y-auto rounded-xl p-1 sm:gap-1.5 sm:rounded-2xl sm:p-1.5">
            {calendarDays.map(({ key, day, date }) => {
              if (!day) return <div key={key} className="min-h-14 rounded-lg bg-white/35 sm:min-h-16 sm:rounded-xl" />;
              const birthdays = birthdaysByDay.get(day) || [];
              const isToday = sameDate(date, today);
              return (
                <div
                  key={key}
                  className={`min-h-14 rounded-lg p-1 shadow-sm sm:min-h-16 sm:rounded-xl sm:p-1.5 ${isToday ? 'bg-[#fff8e5] ring-2 ring-inset ring-[#b78944]' : birthdays.length > 0 ? 'bg-white' : 'bg-white/75'}`}
                >
                  <div className="mb-0.5 flex items-center justify-between gap-1">
                    <span className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold sm:size-6 sm:text-xs ${isToday ? 'bg-[#b78944] text-white' : 'text-slate-600'}`}>
                      {day}
                    </span>
                    {birthdays.length > 0 && <span aria-hidden="true" className="animate-pulse text-[10px] sm:text-xs">🎂</span>}
                  </div>
                  <div className="space-y-0.5">
                    {birthdays.map(({ koala, age }) => (
                      <button
                        key={koala.id}
                        type="button"
                        onClick={() => onKoalaClick(koala)}
                        className={`block w-full overflow-hidden rounded-md px-1 py-0.5 text-left leading-tight shadow-sm transition-transform hover:-translate-y-px focus:outline-none focus:ring-2 sm:flex sm:items-center sm:justify-between sm:gap-1 sm:rounded-lg sm:px-1.5 sm:py-1 ${koala.sex === 'female' ? 'bg-[#f0d2d8] text-[#8a4051] hover:bg-[#e9c1ca] focus:ring-[#c7818d]' : koala.sex === 'male' ? 'bg-[#d6e5eb] text-[#2f667f] hover:bg-[#c5dce5] focus:ring-[#4c7f97]' : 'bg-[#e8e3d5] text-[#665f52] hover:bg-[#ddd5c2] focus:ring-[#8b8b7a]'}`}
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
