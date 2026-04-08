// Uses Web Crypto API (available in Node 19+, all modern browsers)
// AES-256-GCM: authenticated encryption — wrong password throws on decrypt

const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 256;

async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

function toBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(str: string): Uint8Array<ArrayBuffer> {
  const arr = new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
  return new Uint8Array(arr.buffer as ArrayBuffer);
}

export async function encrypt(
  plaintext: string,
  masterPassword: string
): Promise<{ ciphertext: string; iv: string }> {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(masterPassword, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  );
  // Pack salt + ciphertext together so we can re-derive the key on decrypt
  const combined = new Uint8Array(salt.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(new Uint8Array(encrypted), salt.length);
  return { ciphertext: toBase64(combined), iv: toBase64(iv) };
}

export async function decrypt(
  ciphertext: string,
  iv: string,
  masterPassword: string
): Promise<string> {
  const combined = fromBase64(ciphertext);
  const salt = combined.slice(0, 16);
  const data = combined.slice(16);
  const ivBytes = fromBase64(iv);
  const key = await deriveKey(masterPassword, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes },
    key,
    data
  );
  return new TextDecoder().decode(decrypted);
}
