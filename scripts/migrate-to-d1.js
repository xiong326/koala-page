import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');
const DATA_DIR = join(ROOT, 'src', 'data');
const OUT_FILE = join(ROOT, 'migrations', '0002_seed.sql');

function escSQL(val) {
  if (val === null || val === undefined) return 'NULL';
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function main() {
  const board1 = JSON.parse(await readFile(join(DATA_DIR, 'koalas.json'), 'utf-8'));
  const board2 = JSON.parse(await readFile(join(DATA_DIR, 'koalas-board2.json'), 'utf-8'));

  const lines = [];
  lines.push('-- Auto-generated seed data from JSON files');
  lines.push('-- Run: npx wrangler d1 execute koala-db --file=migrations/0002_seed.sql');
  lines.push('');

  function addKoalas(koalas, board) {
    for (const k of koalas) {
      const nicknames = k.nicknames && k.nicknames.length > 0
        ? escSQL(JSON.stringify(k.nicknames))
        : 'NULL';
      const photo = k.photo ? escSQL(k.photo) : 'NULL';
      const mother = k.mother ? escSQL(k.mother) : 'NULL';
      const father = k.father ? escSQL(k.father) : 'NULL';
      const deceased = k.deceased ? 1 : 0;
      const dateOfDeath = k.dateOfDeath ? escSQL(k.dateOfDeath) : 'NULL';
      const birthDate = k.birthDate ? escSQL(k.birthDate) : 'NULL';

      lines.push(
        `INSERT INTO koalas (id, board, name, nicknames, birth_date, sex, photo, mother, father, deceased, date_of_death) VALUES (${escSQL(k.id)}, ${escSQL(board)}, ${escSQL(k.name)}, ${nicknames}, ${birthDate}, ${escSQL(k.sex)}, ${photo}, ${mother}, ${father}, ${deceased}, ${dateOfDeath});`
      );
    }
  }

  lines.push('-- Board 1 (Hongshan)');
  addKoalas(board1.koalas, 'board1');
  lines.push('');
  lines.push('-- Board 2 (Chimelong)');
  addKoalas(board2.koalas, 'board2');

  await writeFile(OUT_FILE, lines.join('\n') + '\n', 'utf-8');
  console.log(`Wrote ${OUT_FILE}`);
  console.log(`Board 1: ${board1.koalas.length} koalas, Board 2: ${board2.koalas.length} koalas`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
