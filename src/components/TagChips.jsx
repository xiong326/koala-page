import { getKoalaTags } from '../utils/tagUtils';

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
          className={`inline-flex max-w-full items-center truncate rounded-full bg-gray-50 font-semibold leading-tight text-gray-600 ring-1 ring-gray-200 ${sizeClass}`}
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
