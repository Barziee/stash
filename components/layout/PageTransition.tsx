'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [transitionKey, setTransitionKey] = useState(0);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      setTransitionKey(k => k + 1);
    }
  }, [pathname]);

  return (
    <div key={transitionKey} className="animate-fade-in-up">
      {children}
    </div>
  );
}
