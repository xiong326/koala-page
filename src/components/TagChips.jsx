import { getKoalaTags } from '../utils/tagUtils';

const TAG_STYLES = [
  'bg-slate-50 text-slate-700 ring-slate-200',
  'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'bg-sky-50 text-sky-700 ring-sky-200',
  'bg-amber-50 text-amber-800 ring-amber-200',
  'bg-rose-50 text-rose-700 ring-rose-200',
  'bg-violet-50 text-violet-700 ring-violet-200',
  'bg-teal-50 text-teal-700 ring-teal-200',
  'bg-stone-50 text-stone-700 ring-stone-200',
];

export default function TagChips({ tags, koala, size = 'sm', className = '' }) {
  const normalizedTags = normalizeInputTags(tags, koala);
  if (normalizedTags.length === 0) return null;

  const sizeClass = size === 'xs'
    ? 'px-1.5 py-0.5 text-[9px]'
    : 'px-2 py-0.5 text-[10px] sm:text-xs';

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {normalizedTags.map(tag => (
        <span
          key={tag}
          className={`inline-flex max-w-full items-center truncate rounded-full font-semibold leading-tight ring-1 ${getTagStyle(tag)} ${sizeClass}`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function normalizeInputTags(tags, koala) {
  if (Array.isArray(tags)) return getKoalaTags({ tags });
  return getKoalaTags(koala);
}

function getTagStyle(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i += 1) {
    hash = (hash * 31 + tag.charCodeAt(i)) % TAG_STYLES.length;
  }
  return TAG_STYLES[hash];
}
