import { useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import { getPhotoUrl } from '../utils/imageUtils';

const PARTICLES = Array.from({ length: 18 }, (_, index) => ({
  angle: index * 20,
  delay: (index % 6) * 55,
  distance: 120 + (index % 3) * 24,
  color: ['#c7818d', '#4c7f97', '#6f8a70', '#b78944', '#8d719b', '#d7a45c'][index % 6],
}));

export default function BirthdayCelebration({ birthdays, onClose }) {
  const { language } = useLanguage();

  useEffect(() => {
    const timeout = window.setTimeout(onClose, 5600);
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const joinNames = (items) => items.map(({ koala }) => koala.name).join(language === 'zh' ? '、' : ', ');
  const exactBirthdays = birthdays.filter((birthday) => !birthday.monthOnly);
  const monthOnlyBirthdays = birthdays.filter((birthday) => birthday.monthOnly);
  const title = exactBirthdays.length > 0
    ? t('birthdayCelebrationTitle', language)
    : t('birthdayCelebrationMonthTitle', language);
  const message = exactBirthdays.length > 0 && monthOnlyBirthdays.length > 0
    ? t('birthdayCelebrationMixedMessage', language, {
      todayNames: joinNames(exactBirthdays),
      monthNames: joinNames(monthOnlyBirthdays),
    })
    : monthOnlyBirthdays.length > 0
      ? t('birthdayCelebrationMonthMessage', language, { names: joinNames(monthOnlyBirthdays) })
      : t('birthdayCelebrationMessage', language, { names: joinNames(exactBirthdays) });

  return (
    <div className="birthday-celebration" role="dialog" aria-modal="true" aria-labelledby="birthday-celebration-title" onClick={onClose}>
      <section className="birthday-celebration-card" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="birthday-celebration-close"
          onClick={onClose}
          aria-label={t('birthdayCelebrationClose', language)}
        >
          ×
        </button>

        <div className="birthday-celebration-burst" aria-hidden="true">
          {PARTICLES.map((particle, index) => (
            <span
              key={particle.angle}
              style={{
                '--particle-angle': `${particle.angle}deg`,
                '--particle-counter-angle': `${-particle.angle}deg`,
                '--particle-delay': `${particle.delay}ms`,
                '--particle-distance': `${particle.distance}px`,
                '--particle-color': particle.color,
              }}
            >
              {index % 5 === 0 ? '🌿' : index % 7 === 0 ? '✦' : ''}
            </span>
          ))}
        </div>

        <p className="birthday-celebration-eyebrow" aria-hidden="true">🌿 · 🎂 · 🌿</p>
        <h2 id="birthday-celebration-title">{title}</h2>
        <p className="birthday-celebration-message">
          {message}
        </p>

        <div className="birthday-celebration-avatars">
          {birthdays.map(({ koala, upcomingAge, monthOnly }, index) => (
            <div
              key={koala.id}
              className="birthday-celebration-koala"
              style={{ '--avatar-delay': `${180 + index * 120}ms` }}
            >
              <div className={`birthday-celebration-avatar ${koala.sex === 'female' ? 'is-female' : koala.sex === 'male' ? 'is-male' : 'is-neutral'}`}>
                {koala.photo ? (
                  <img src={getPhotoUrl(koala.photo, 'medium')} alt={koala.name} />
                ) : (
                  <span aria-hidden="true">🐨</span>
                )}
              </div>
              <strong>{koala.name}</strong>
              <span>{t('ageYearsFormat', language, { age: upcomingAge })}</span>
              {monthOnly && (
                <small className="birthday-celebration-month-note">
                  {t('birthdayCalendarMonthUnknown', language)}
                </small>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
