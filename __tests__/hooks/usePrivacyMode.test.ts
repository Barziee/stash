import { renderHook, act } from '@testing-library/react';
import { usePrivacyMode } from '@/hooks/usePrivacyMode';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => { store[key] = val; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

describe('usePrivacyMode', () => {
  beforeEach(() => localStorageMock.clear());

  it('starts hidden=false by default', () => {
    const { result } = renderHook(() => usePrivacyMode());
    expect(result.current[0]).toBe(false);
  });

  it('toggles to true on first call', () => {
    const { result } = renderHook(() => usePrivacyMode());
    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);
  });

  it('toggles back to false on second call', () => {
    const { result } = renderHook(() => usePrivacyMode());
    act(() => result.current[1]());
    act(() => result.current[1]());
    expect(result.current[0]).toBe(false);
  });

  it('persists across remounts via localStorage', () => {
    const { result: r1 } = renderHook(() => usePrivacyMode());
    act(() => r1.current[1]());
    const { result: r2 } = renderHook(() => usePrivacyMode());
    expect(r2.current[0]).toBe(true);
  });
});
