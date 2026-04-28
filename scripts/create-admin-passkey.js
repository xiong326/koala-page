import { writeFile } from 'fs/promises';
import { join } from 'path';

const PBKDF2_ITERATIONS = 100000;

function hexEncode(buffer) {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function main() {
  const code = process.argv[2];
  if (!code) {
    console.error('Usage: node scripts/create-admin-passkey.js <access-code>');
    console.error('Example: node scripts/create-admin-passkey.js my-secret-admin-code');
    process.exit(1);
  }

  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const saltHex = hexEncode(salt);

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(code),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  );
  const hashHex = hexEncode(bits);

  const sql = `INSERT INTO passkeys (name, hash, salt, role) VALUES ('Admin', '${hashHex}', '${saltHex}', 'admin');\n`;

  const outFile = join(import.meta.dirname, '..', 'migrations', '0003_admin_passkey.sql');
  await writeFile(outFile, sql, 'utf-8');

  console.log(`Admin passkey SQL written to: migrations/0003_admin_passkey.sql`);
  console.log(`Access code: ${code}`);
  console.log(`(Keep this code safe — it will not be shown again)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
