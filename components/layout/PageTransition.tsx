'use client';
import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef, useState } from 'react';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [phase, setPhase] = useState<'idle' | 'exit' | 'enter'>('idle');

  useLayoutEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      // Set exit state synchronously before browser paints — no flash
      setPhase('exit');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase('enter');
        });
      });
    }
  }, [pathname]);

  return (
    <div className={phase === 'exit' ? 'page-exit' : phase === 'enter' ? 'page-enter' : ''}>
      {children}
    </div>
  );
}
