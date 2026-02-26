/**
 * Maps an original photo path to an optimized WebP variant.
 *
 * Sizes: 'thumb' (128px), 'medium' (256px), 'original'
 */
export function getPhotoUrl(photo, size = 'thumb') {
  if (!photo) return null;
  if (size === 'original') return photo;

  const filename = photo.split('/').pop().replace(/\.\w+$/, '.webp');
  return `/images/koalas/${size}/${filename}`;
}
