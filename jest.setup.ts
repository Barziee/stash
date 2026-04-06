import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';
import { webcrypto } from 'crypto';

// Polyfill Web APIs missing from jest-environment-jsdom
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (obj: unknown) => JSON.parse(JSON.stringify(obj));
}
if (typeof globalThis.TextEncoder === 'undefined') {
  Object.assign(globalThis, { TextEncoder, TextDecoder });
}
// Always use Node's webcrypto so crypto.subtle is available
Object.defineProperty(globalThis, 'crypto', { value: webcrypto, writable: true });
