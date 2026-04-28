const R2_PREFIX = 'r2://';

export function getPhotoUrl(photo, size = 'thumb') {
  if (!photo) return null;
  if (size === 'original') return photo;

  if (photo.startsWith(R2_PREFIX)) {
    const name = photo.slice(R2_PREFIX.length);
    return `/api/images/${size}/${name}.webp`;
  }

  const filename = photo.split('/').pop().replace(/\.\w+$/, '.webp');
  return `/images/koalas/${size}/${filename}`;
}
