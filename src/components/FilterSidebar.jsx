import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import { calculateGeneration } from '../utils/graphHelpers';
import { calculateAgeInYears, calculateAgeParts, formatAgeForDisplay, getAgeForDisplay } from '../utils/ageUtils';
import { parseKoalaDateString } from '../utils/dateUtils';
import { getPhotoUrl } from '../utils/imageUtils';
import { useGeneration } from '../contexts/GenerationContext';
import ForestSelect from './ForestSelect';
import ForestSegmentedControl from './ForestSegmentedControl';
import { EarthServiceIcon, KoalaStarIcon } from './KoalaStatusIcons';

export default function FilterSidebar({ koalas, onKoalaClick, isOpen, onToggle }) {
  const { language } = useLanguage();
  const { generationMethod } = useGeneration();
  const [filters, setFilters] = useState({
    sex: 'all',
    ageRange: 'all',
    generation: 'all',
    deceased: 'all',
  });
  const [customAgeRange, setCustomAgeRange] = useState({
    minAge: '',
    maxAge: '',
  });
  const [filteredKoalas, setFilteredKoalas] = useState([]);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  // Calculate generations for all koalas
  const koalasWithGeneration = koalas.map(koala => {
    const ageUnknown = !!koala.deceased && !koala.dateOfDeath;
    const endDate = koala.deceased ? koala.dateOfDeath : null;
    const generation = calculateGeneration(koala.id, koalas, generationMethod);

    if (ageUnknown) {
      return {
        ...koala,
        generation,
        ageUnknown: true,
        ageInYears: null,
        preciseAge: null,
        ageForDisplay: null,
      };
    }

    const ageParts = calculateAgeParts(koala.birthDate, endDate);
    const preciseAge = ageParts
      ? ageParts.years + ageParts.months / 12 + ageParts.days / 365
      : 0;
    return {
      ...koala,
      generation,
      ageUnknown: false,
      ageInYears: calculateAgeInYears(koala.birthDate, endDate),
      preciseAge,
      ageForDisplay: getAgeForDisplay(koala.birthDate, endDate),
    };
  });

  // Get unique generations
  const generations = [...new Set(koalasWithGeneration.map(k => k.generation))].sort((a, b) => a - b);

  // Apply filters
  useEffect(() => {
    let result = [...koalasWithGeneration];

    // Filter by sex
    if (filters.sex !== 'all') {
      result = result.filter(k => k.sex === filters.sex);
    }

    // Filter by age range
    if (filters.ageRange !== 'all') {
      result = result.filter(k => {
        if (k.ageUnknown) return false;
        const age = k.ageInYears;
        switch (filters.ageRange) {
          case 'infant': return age < 1;
          case 'young': return age >= 1 && age < 3;
          case 'adult': return age >= 3 && age < 10;
          case 'senior': return age >= 10;
          case 'custom': {
            const minAge = customAgeRange.minAge === '' ? 0 : parseInt(customAgeRange.minAge);
            const maxAge = customAgeRange.maxAge === '' ? Infinity : parseInt(customAgeRange.maxAge);
            return age >= minAge && age <= maxAge;
          }
          default: return true;
        }
      });
    }

    // Filter by generation
    if (filters.generation !== 'all') {
      result = result.filter(k => k.generation === parseInt(filters.generation));
    }

    // Filter by deceased status
    if (filters.deceased !== 'all') {
      const isDeceased = filters.deceased === 'yes';
      result = result.filter(k => !!k.deceased === isDeceased);
    }

    // Sort by age from oldest to youngest; unknown-age koalas go last, tiebreak on birthDate
    result.sort((a, b) => {
      if (a.ageUnknown && b.ageUnknown) {
        const da = parseKoalaDateString(a.birthDate);
        const db = parseKoalaDateString(b.birthDate);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return da - db;
      }
      if (a.ageUnknown) return 1;
      if (b.ageUnknown) return -1;
      return b.preciseAge - a.preciseAge;
    });

    setFilteredKoalas(result);
  }, [filters, koalas, customAgeRange, generationMethod]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleKoalaClick = (koala) => {
    onKoalaClick(koala);
  };

  const clearFilters = () => {
    setFilters({
      sex: 'all',
      ageRange: 'all',
      generation: 'all',
      deceased: 'all',
    });
    setCustomAgeRange({
      minAge: '',
      maxAge: '',
    });
  };

  const handleCustomAgeChange = (field, value) => {
    // Only allow positive integers
    if (value === '' || /^\d+$/.test(value)) {
      setCustomAgeRange(prev => ({ ...prev, [field]: value }));
      // Auto-select custom when user enters values
      if (filters.ageRange !== 'custom') {
        handleFilterChange('ageRange', 'custom');
      }
    }
  };

  const hasActiveFilters = filters.sex !== 'all' || filters.ageRange !== 'all' || filters.generation !== 'all' || filters.deceased !== 'all';

  return (
    <>
      {/* Toggle Button - only show when closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="forest-action koala-bite-inset absolute top-2 left-2 z-20 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
        >
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="hidden sm:inline">{t('filterTitle', language)}</span>
          {hasActiveFilters && (
            <span className="bg-slate-700 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
              {[filters.sex !== 'all', filters.ageRange !== 'all', filters.generation !== 'all', filters.deceased !== 'all'].filter(Boolean).length}
            </span>
          )}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`absolute top-0 left-0 h-full transition-all duration-300 z-10 flex flex-col ${
          isOpen
            ? 'forest-panel w-48 rounded-[18px] border bg-white shadow-lg sm:w-56 md:w-64'
            : 'w-0 border-0 bg-transparent shadow-none'
        } overflow-hidden`}
      >
        <div className="border-b border-gray-200 flex items-center justify-between gap-2 px-3 py-2">
          <button
            onClick={onToggle}
            className="text-gray-600 hover:text-gray-800 font-bold text-lg leading-none"
            title="Collapse"
          >
            ‹‹
          </button>
          <h3 className="font-semibold text-sm sm:text-base text-gray-800 flex-1">{t('filterTitle', language)}</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-slate-600 hover:text-slate-900 underline whitespace-nowrap"
            >
              {t('clearFilters', language)}
            </button>
          )}
        </div>

        <div className="border-b border-gray-200">
          <button
            type="button"
            onClick={() => setFiltersExpanded(prev => !prev)}
            className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-gray-50"
            aria-expanded={filtersExpanded}
          >
            <span className="text-xs font-semibold text-gray-700">
              {t('filterConditions', language)}
            </span>
            <span className="flex items-center gap-2 text-xs text-gray-500">
              {hasActiveFilters && (
                <span className="bg-slate-100 text-slate-700 rounded-full px-1.5 py-0.5">
                  {[filters.sex !== 'all', filters.ageRange !== 'all', filters.generation !== 'all', filters.deceased !== 'all'].filter(Boolean).length}
                </span>
              )}
              <span className="text-base leading-none">{filtersExpanded ? '⌃' : '⌄'}</span>
            </span>
          </button>
        </div>

        {/* Filters */}
        {filtersExpanded && (
          <div className="max-h-[39%] shrink-0 space-y-2 overflow-y-auto px-3 py-2">
            {/* Sex Filter */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                {t('filterBySex', language)}
              </label>
              <ForestSegmentedControl
                value={filters.sex}
                onChange={(value) => handleFilterChange('sex', value)}
                ariaLabel={t('filterBySex', language)}
                className="w-full"
                options={[
                  { value: 'all', label: t('all', language) },
                  { value: 'male', label: t('male', language), tone: 'male' },
                  { value: 'female', label: t('female', language), tone: 'female' },
                ]}
              />
            </div>

            {/* Age Range Filter */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                {t('filterByAge', language)}
              </label>
              <ForestSelect
                value={filters.ageRange}
                onChange={(value) => handleFilterChange('ageRange', value)}
                ariaLabel={t('filterByAge', language)}
                options={[
                  { value: 'all', label: t('all', language) },
                  { value: 'infant', label: `${t('ageInfant', language)} (< 1 ${t('years', language)})` },
                  { value: 'young', label: `${t('ageYoung', language)} (1-3 ${t('years', language)})` },
                  { value: 'adult', label: `${t('ageAdult', language)} (3-10 ${t('years', language)})` },
                  { value: 'senior', label: `${t('ageSenior', language)} (10+ ${t('years', language)})` },
                  { value: 'custom', label: t('ageCustom', language) },
                ]}
              />

              {/* Custom Age Range Inputs */}
              {filters.ageRange === 'custom' && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder={t('minAge', language)}
                      value={customAgeRange.minAge}
                      onChange={(e) => handleCustomAgeChange('minAge', e.target.value)}
                      className="w-12 px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent text-center"
                      maxLength="2"
                    />
                    <span className="text-gray-500 text-xs">-</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder={t('maxAge', language)}
                      value={customAgeRange.maxAge}
                      onChange={(e) => handleCustomAgeChange('maxAge', e.target.value)}
                      className="w-12 px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent text-center"
                      maxLength="2"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {t('customAgeHint', language)}
                  </p>
                </div>
              )}
            </div>

            {/* Generation Filter */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                {t('filterByGeneration', language)}
              </label>
              <ForestSelect
                value={filters.generation}
                onChange={(value) => handleFilterChange('generation', value)}
                ariaLabel={t('filterByGeneration', language)}
                options={[
                  { value: 'all', label: t('all', language) },
                  ...generations.map((gen) => ({
                    value: String(gen),
                    label: t('generationFormat', language, { gen }),
                  })),
                ]}
              />
            </div>

            {/* Deceased Filter */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                {t('filterByDeceased', language)}
              </label>
              <ForestSegmentedControl
                value={filters.deceased}
                onChange={(value) => handleFilterChange('deceased', value)}
                ariaLabel={t('filterByDeceased', language)}
                className="w-full"
                options={[
                  { value: 'all', label: t('all', language) },
                  {
                    value: 'no',
                    label: t('alive', language),
                    tone: 'alive',
                    icon: <EarthServiceIcon className="size-6" />,
                  },
                  {
                    value: 'yes',
                    label: t('deceased', language),
                    tone: 'deceased',
                    icon: <KoalaStarIcon className="size-6" />,
                  },
                ]}
              />
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="border-b border-gray-200 px-3 py-1.5">
            <p className="text-xs sm:text-sm text-gray-600">
              {t('showingCount', language, { filtered: filteredKoalas.length, total: koalas.length })}
            </p>
        </div>

        {/* Filtered Results List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-2">
            {filteredKoalas.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                {t('noResults', language)}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredKoalas.map(koala => (
                  <button
                    key={koala.id}
                    onClick={() => handleKoalaClick(koala)}
                    className="w-full text-left px-2 py-1.5 sm:px-3 sm:py-2 rounded hover:bg-slate-50 focus:bg-slate-50 focus:outline-none transition-colors"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {koala.photo && (
                        <img
                          src={getPhotoUrl(koala.photo, 'thumb')}
                          alt={koala.name}
                          loading="lazy"
                          width={32}
                          height={32}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-gray-800 truncate">
                          {koala.name}
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                          <span className={koala.sex === 'female' ? 'text-[#a6536b]' : 'text-[#2f667f]'}>
                            {t(koala.sex, language)}
                          </span>
                          <span>•</span>
                          <span>{koala.ageUnknown ? t('unknown', language) : koala.ageForDisplay ? formatAgeForDisplay(koala.ageForDisplay, t, language) : `${koala.ageInYears} ${t('years', language)}`}</span>
                          <span>•</span>
                          <span>
                            {t('generationShortFormat', language, { gen: koala.generation })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
