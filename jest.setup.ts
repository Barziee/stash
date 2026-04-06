import '@testing-library/jest-dom';

// Polyfill structuredClone for jest-environment-jsdom
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (obj: unknown) => JSON.parse(JSON.stringify(obj));
}
