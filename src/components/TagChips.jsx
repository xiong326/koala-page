import { getKoalaTags } from '../utils/tagUtils';

const TAG_STYLES = [
  'bg-[#d9e5ea] text-[#3f687a] ring-[#9fb9c5]',
  'bg-[#d4e8d5] text-[#3f7049] ring-[#91b397]',
  'bg-[#d2e8f1] text-[#386e85] ring-[#8fb9ca]',
  'bg-[#f2dfbd] text-[#805923] ring-[#d0a667]',
  'bg-[#f0d2d8] text-[#8a4051] ring-[#cf8b98]',
  'bg-[#e2d5eb] text-[#684b7c] ring-[#ac8ebd]',
  'bg-[#cfe8e2] text-[#356f67] ring-[#86b8ac]',
  'bg-[#ead8cb] text-[#76513c] ring-[#bd9880]',
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
