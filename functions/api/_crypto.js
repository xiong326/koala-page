const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 256;

export function hexEncode(buffer) {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function hexDecode(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export async function generateSalt() {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return hexEncode(salt);
}

export async function hashPasskey(code, saltHex) {
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
      salt: hexDecode(saltHex),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH,
  );
  return hexEncode(bits);
}

export function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return hexEncode(bytes);
}

export function generateAccessCode() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return hexEncode(bytes);
}
