import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, extname, basename } from 'path';

const SIZES = {
  thumb:  { width: 128, quality: 75 },
  medium: { width: 256, quality: 80 },
};

const SOURCE_DIR = join(import.meta.dirname, '..', 'public', 'images', 'koalas');
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

async function optimizeImages() {
  const files = await readdir(SOURCE_DIR);
  const imageFiles = files.filter(f => {
    const ext = extname(f).toLowerCase();
    return IMAGE_EXTS.has(ext) && !f.startsWith('.');
  });

  console.log(`Found ${imageFiles.length} images to optimize`);

  for (const [sizeName, { width, quality }] of Object.entries(SIZES)) {
    const outDir = join(SOURCE_DIR, sizeName);
    await mkdir(outDir, { recursive: true });

    let processed = 0;
    let skipped = 0;

    for (const file of imageFiles) {
      const inputPath = join(SOURCE_DIR, file);
      const outName = basename(file, extname(file)) + '.webp';
      const outputPath = join(outDir, outName);

      try {
        await sharp(inputPath)
          .resize(width, null, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality })
          .toFile(outputPath);
        processed++;
      } catch (err) {
        console.error(`  Failed: ${file} - ${err.message}`);
        skipped++;
      }
    }

    console.log(`  ${sizeName}: ${processed} processed, ${skipped} skipped`);
  }

  console.log('Done!');
}

optimizeImages().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
