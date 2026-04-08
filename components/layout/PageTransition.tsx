'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [animating, setAnimating] = useState(false);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      setAnimating(true);
      const timeout = setTimeout(() => setAnimating(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [pathname]);

  return (
    <div
      className={animating ? 'animate-fade-in-up' : ''}
      style={{ willChange: animating ? 'transform, opacity' : 'auto' }}
    >
      {children}
    </div>
  );
}
