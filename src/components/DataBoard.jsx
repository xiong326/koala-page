import { useState, useMemo, useRef, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from 'recharts';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import {
  enrichAll,
  computePopulationStats,
  computeAgeStats,
  computeAgeDistribution,
  computeBirthMonthDistribution,
  computeOffspringRanking,
  computeGenerationDistribution,
  computeFounderStats,
  computeBirthsPerYear,
} from '../utils/statsHelpers';
import { formatAgeForDisplay } from '../utils/ageUtils';

const PIE_COLORS = ['#3b82f6', '#ec4899'];
const BAR_COLOR = '#64748b';
const BAR_COLOR_ALT = '#f59e0b';

const MONTH_KEYS = [
  'dbJan', 'dbFeb', 'dbMar', 'dbApr', 'dbMay', 'dbJun',
  'dbJul', 'dbAug', 'dbSep', 'dbOct', 'dbNov', 'dbDec',
];

function KoalaLink({ name, koalaId, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(koalaId)}
      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-left font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-400"
    >
      {name}
      <span aria-hidden="true" className="text-[10px] leading-none text-slate-400">›</span>
    </button>
  );
}

function StatCard({ label, value, sub, className = '' }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-3 sm:p-4 ${className}`}>
      <p className="text-xs sm:text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function SegmentedFilter({ label, value, options, onChange }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[11px] font-semibold text-gray-500 sm:text-xs">{label}</span>
      <div className="flex overflow-hidden rounded-md border border-gray-300 bg-gray-100 p-0.5">
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-2 py-1 text-xs font-medium transition-colors sm:text-sm ${
              value === option.value
                ? 'rounded bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:bg-white/70'
            }`}
            aria-pressed={value === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function GenerationMultiSelect({ generations, selected, onChange, language }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (g) => {
    const next = new Set(selected);
    if (next.has(g)) next.delete(g);
    else next.add(g);
    onChange(next);
  };

  const label = selected.size === 0
    ? `${t('filterByGeneration', language)}: ${t('all', language)}`
    : selected.size === 1
      ? (language === 'zh' ? `第${[...selected][0]}代` : `Gen ${[...selected][0]}`)
      : (language === 'zh' ? `${selected.size}个世代` : `${selected.size} Gens`);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white flex items-center gap-1 min-w-[100px]"
      >
        <span className="flex-1 text-left truncate">{label}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto min-w-[140px]">
          {generations.map(g => (
            <label key={g} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-xs sm:text-sm">
              <input
                type="checkbox"
                checked={selected.has(g)}
                onChange={() => toggle(g)}
                className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
              />
              {language === 'zh' ? `第${g}代` : `${t('generation', language)} ${g}`}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DataBoard({ koalas, isOpen, onClose, onKoalaClick }) {
  const { language } = useLanguage();

  const [filters, setFilters] = useState({
    sex: 'all',
    selectedGenerations: new Set(),
    deceased: 'all',
    birthYearMin: '',
    birthYearMax: '',
  });

  const enriched = useMemo(() => enrichAll(koalas), [koalas]);

  const generations = useMemo(
    () => [...new Set(enriched.map(k => k.generation))].sort((a, b) => a - b),
    [enriched],
  );

  const birthYearRange = useMemo(() => {
    let min = Infinity, max = -Infinity;
    enriched.forEach(k => {
      if (!k.birthDate) return;
      const y = parseInt(k.birthDate.split('-')[0], 10);
      if (Number.isFinite(y)) {
        if (y < min) min = y;
        if (y > max) max = y;
      }
    });
    return { min: Number.isFinite(min) ? min : 2000, max: Number.isFinite(max) ? max : 2025 };
  }, [enriched]);

  const filtered = useMemo(() => {
    let result = enriched;
    if (filters.sex !== 'all') result = result.filter(k => k.sex === filters.sex);
    if (filters.selectedGenerations.size > 0) {
      result = result.filter(k => filters.selectedGenerations.has(k.generation));
    }
    if (filters.deceased !== 'all') {
      const dec = filters.deceased === 'yes';
      result = result.filter(k => !!k.deceased === dec);
    }
    if (filters.birthYearMin !== '' || filters.birthYearMax !== '') {
      const minY = filters.birthYearMin === '' ? -Infinity : parseInt(filters.birthYearMin, 10);
      const maxY = filters.birthYearMax === '' ? Infinity : parseInt(filters.birthYearMax, 10);
      result = result.filter(k => {
        if (!k.birthDate) return false;
        const y = parseInt(k.birthDate.split('-')[0], 10);
        return Number.isFinite(y) && y >= minY && y <= maxY;
      });
    }
    return result;
  }, [enriched, filters]);

  const pop = useMemo(() => computePopulationStats(filtered), [filtered]);
  const age = useMemo(() => computeAgeStats(filtered), [filtered]);
  const ageDist = useMemo(() => computeAgeDistribution(filtered), [filtered]);
  const birthMonth = useMemo(() => computeBirthMonthDistribution(filtered), [filtered]);
  const topParents = useMemo(() => computeOffspringRanking(filtered, enriched), [filtered, enriched]);
  const genDist = useMemo(() => computeGenerationDistribution(filtered), [filtered]);
  const founders = useMemo(() => computeFounderStats(filtered), [filtered]);
  const birthsYear = useMemo(() => computeBirthsPerYear(filtered), [filtered]);

  const sexData = useMemo(() => [
    { name: t('male', language), value: pop.males },
    { name: t('female', language), value: pop.females },
  ], [pop, language]);

  const localizedBirthMonth = useMemo(
    () => birthMonth.map((d, i) => ({ ...d, label: t(MONTH_KEYS[i], language) })),
    [birthMonth, language],
  );

  const localizedGenDist = useMemo(
    () => genDist.map(d => ({
      ...d,
      label: language === 'zh' ? `第${d.generation}代` : `Gen ${d.generation}`,
    })),
    [genDist, language],
  );

  const handleChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  const clearFilters = () => setFilters({
    sex: 'all',
    selectedGenerations: new Set(),
    deceased: 'all',
    birthYearMin: '',
    birthYearMax: '',
  });

  const hasActiveFilters =
    filters.sex !== 'all' ||
    filters.selectedGenerations.size > 0 ||
    filters.deceased !== 'all' ||
    filters.birthYearMin !== '' ||
    filters.birthYearMax !== '';

  const handleKoalaNav = (koalaId) => {
    if (onKoalaClick) {
      onClose();
      const koala = koalas.find(k => k.id === koalaId);
      if (koala) {
        setTimeout(() => onKoalaClick(koala), 100);
      }
    }
  };

  const handleBirthYearChange = (field, value) => {
    if (value === '' || /^\d{0,4}$/.test(value)) {
      handleChange(field, value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-gray-50 w-[95vw] max-w-5xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 bg-white">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">{t('dataBoard', language)}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 border-b border-gray-200 bg-white">
          <SegmentedFilter
            label={t('filterBySex', language)}
            value={filters.sex}
            onChange={(value) => handleChange('sex', value)}
            options={[
              { value: 'all', label: t('all', language) },
              { value: 'male', label: t('male', language) },
              { value: 'female', label: t('female', language) },
            ]}
          />

          <GenerationMultiSelect
            generations={generations}
            selected={filters.selectedGenerations}
            onChange={(s) => handleChange('selectedGenerations', s)}
            language={language}
          />

          <SegmentedFilter
            label={t('filterByDeceased', language)}
            value={filters.deceased}
            onChange={(value) => handleChange('deceased', value)}
            options={[
              { value: 'all', label: t('all', language) },
              { value: 'no', label: t('alive', language) },
              { value: 'yes', label: t('deceased', language) },
            ]}
          />

          <div className="flex items-center gap-1">
            <input
              type="text"
              inputMode="numeric"
              placeholder={birthYearRange.min}
              value={filters.birthYearMin}
              onChange={e => handleBirthYearChange('birthYearMin', e.target.value)}
              className="w-16 px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent text-center"
              maxLength="4"
            />
            <span className="text-gray-400 text-xs">-</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder={birthYearRange.max}
              value={filters.birthYearMax}
              onChange={e => handleBirthYearChange('birthYearMax', e.target.value)}
              className="w-16 px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent text-center"
              maxLength="4"
            />
            <span className="text-gray-400 text-xs ml-0.5">{t('dbYear', language)}</span>
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-slate-600 hover:text-slate-900 underline ml-auto">
              {t('clearFilters', language)}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">{t('dbNoData', language)}</div>
          ) : (
            <>
              {/* Row 1: Population overview */}
              <section>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">{t('dbPopulation', language)}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard label={t('dbTotal', language)} value={pop.total} />
                  <StatCard
                    label={t('dbAlive', language)}
                    value={pop.alive}
                    sub={pop.total > 0 ? `${Math.round((pop.alive / pop.total) * 100)}%` : ''}
                  />
                  <StatCard
                    label={t('dbDeceased', language)}
                    value={pop.deceased}
                    sub={pop.total > 0 ? `${Math.round((pop.deceased / pop.total) * 100)}%` : ''}
                  />
                  <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">{t('dbSexRatio', language)}</p>
                    <ResponsiveContainer width="100%" height={100}>
                      <PieChart>
                        <Pie data={sexData} dataKey="value" cx="50%" cy="50%" outerRadius={40} innerRadius={20}>
                          {sexData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              {/* Row 2: Age analytics */}
              <section>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">{t('dbAgeAnalytics', language)}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard
                    label={t('dbAverageAge', language)}
                    value={`${age.averageAge} ${t('years', language)}`}
                  />
                  <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">{t('dbOldest', language)}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">
                      {age.oldest
                        ? <KoalaLink name={age.oldest.name} koalaId={age.oldest.id} onClick={handleKoalaNav} />
                        : '-'}
                    </p>
                    {age.oldest && <p className="text-xs text-gray-400 mt-1">{age.oldest.ageForDisplay ? formatAgeForDisplay(age.oldest.ageForDisplay, t, language) : `${age.oldest.ageInYears} ${t('years', language)}`}</p>}
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">{t('dbYoungest', language)}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">
                      {age.youngest
                        ? <KoalaLink name={age.youngest.name} koalaId={age.youngest.id} onClick={handleKoalaNav} />
                        : '-'}
                    </p>
                    {age.youngest && <p className="text-xs text-gray-400 mt-1">{age.youngest.ageForDisplay ? formatAgeForDisplay(age.youngest.ageForDisplay, t, language) : `${age.youngest.ageInYears} ${t('years', language)}`}</p>}
                  </div>
                  <StatCard
                    label={t('dbAvgLifespan', language)}
                    value={age.deceasedCount > 0 ? `${age.avgLifespan} ${t('years', language)}` : '-'}
                  />
                </div>
              </section>

              {/* Row 3: Charts */}
              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 font-semibold">{t('dbAgeDistribution', language)}</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={ageDist}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill={BAR_COLOR} name={t('dbCount', language)} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 font-semibold">{t('dbBirthMonth', language)}</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={localizedBirthMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill={BAR_COLOR_ALT} name={t('dbCount', language)} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              {/* Row 4: Family / lineage */}
              <section>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">{t('dbFamily', language)}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 font-semibold">{t('dbTopParents', language)}</p>
                    {topParents.length === 0 ? (
                      <p className="text-xs text-gray-400">-</p>
                    ) : (
                      <ol className="space-y-1.5">
                        {topParents.map((p, i) => (
                          <li key={p.id} className="flex items-center gap-2 text-sm">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                            <KoalaLink name={p.name} koalaId={p.id} onClick={handleKoalaNav} />
                            <span className="text-gray-400 ml-auto">{p.count} {t('dbOffspring', language)}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 font-semibold">{t('dbGenerationDist', language)}</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={localizedGenDist}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10b981" name={t('dbCount', language)} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>{t('dbFounders', language)}: {founders.founderCount}</span>
                      <span>{t('dbDeepestGen', language)}: {founders.deepestGeneration}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Row 5: Births per year */}
              <section>
                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 font-semibold">{t('dbBirthsPerYear', language)}</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={birthsYear}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" name={t('dbCount', language)} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
