import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import { calculateGeneration } from '../utils/graphHelpers';
import { calculateAgeInYears } from '../utils/ageUtils';
import { getPhotoUrl } from '../utils/imageUtils';

export default function FilterSidebar({ koalas, onKoalaClick, isOpen, onToggle }) {
  const { language } = useLanguage();
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

  // Calculate generations for all koalas
  const koalasWithGeneration = koalas.map(koala => ({
    ...koala,
    generation: calculateGeneration(koala.id, koalas),
    ageInYears: koala.deceased
      ? calculateAgeInYears(koala.birthDate, koala.dateOfDeath)
      : calculateAgeInYears(koala.birthDate),
  }));

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

    // Sort by age from oldest to youngest
    result.sort((a, b) => b.ageInYears - a.ageInYears);

    setFilteredKoalas(result);
  }, [filters, koalas, customAgeRange]);

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
          className="absolute top-2 left-2 z-20 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-md bg-white/90 border border-gray-300 shadow hover:bg-white flex items-center gap-1 sm:gap-2"
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
            <span className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
              {[filters.sex !== 'all', filters.ageRange !== 'all', filters.generation !== 'all', filters.deceased !== 'all'].filter(Boolean).length}
            </span>
          )}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`absolute top-0 left-0 h-full bg-white border-r border-gray-300 shadow-lg transition-all duration-300 z-10 flex flex-col ${
          isOpen ? 'w-48 sm:w-56 md:w-64' : 'w-0'
        } overflow-hidden`}
      >
        <div className="p-2 sm:p-3 md:p-4 border-b border-gray-200 flex justify-between items-center gap-2">
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
              className="text-xs text-blue-600 hover:text-blue-800 underline whitespace-nowrap"
            >
              {t('clearFilters', language)}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="p-2 sm:p-3 md:p-4 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
          {/* Sex Filter */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              {t('filterBySex', language)}
            </label>
            <select
              value={filters.sex}
              onChange={(e) => handleFilterChange('sex', e.target.value)}
              className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t('all', language)}</option>
              <option value="male">{t('male', language)}</option>
              <option value="female">{t('female', language)}</option>
            </select>
          </div>

          {/* Age Range Filter */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              {t('filterByAge', language)}
            </label>
            <select
              value={filters.ageRange}
              onChange={(e) => handleFilterChange('ageRange', e.target.value)}
              className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t('all', language)}</option>
              <option value="infant">{t('ageInfant', language)} (&lt; 1 {t('years', language)})</option>
              <option value="young">{t('ageYoung', language)} (1-3 {t('years', language)})</option>
              <option value="adult">{t('ageAdult', language)} (3-10 {t('years', language)})</option>
              <option value="senior">{t('ageSenior', language)} (10+ {t('years', language)})</option>
              <option value="custom">{t('ageCustom', language)}</option>
            </select>

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
                    className="w-12 px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                    maxLength="2"
                  />
                  <span className="text-gray-500 text-xs">-</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={t('maxAge', language)}
                    value={customAgeRange.maxAge}
                    onChange={(e) => handleCustomAgeChange('maxAge', e.target.value)}
                    className="w-12 px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
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
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              {t('filterByGeneration', language)}
            </label>
            <select
              value={filters.generation}
              onChange={(e) => handleFilterChange('generation', e.target.value)}
              className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t('all', language)}</option>
              {generations.map(gen => (
                <option key={gen} value={gen}>
                  {t('generationFormat', language, { gen })}
                </option>
              ))}
            </select>
          </div>

          {/* Deceased Filter */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              {t('filterByDeceased', language)}
            </label>
            <select
              value={filters.deceased}
              onChange={(e) => handleFilterChange('deceased', e.target.value)}
              className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t('all', language)}</option>
              <option value="no">{t('alive', language)}</option>
              <option value="yes">{t('deceased', language)}</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600">
              {t('showingCount', language, { filtered: filteredKoalas.length, total: koalas.length })}
            </p>
          </div>
        </div>

        {/* Filtered Results List */}
        <div className="border-t border-gray-200 flex-1 overflow-y-auto min-h-0">
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
                    className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {koala.photo && (
                        <img
                          src={getPhotoUrl(koala.photo, 'thumb')}
                          alt={koala.name}
                          loading="lazy"
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-800 truncate">
                          {koala.name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span className={koala.sex === 'female' ? 'text-pink-600' : 'text-blue-600'}>
                            {t(koala.sex, language)}
                          </span>
                          <span>•</span>
                          <span>{koala.ageInYears} {t('years', language)}</span>
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
