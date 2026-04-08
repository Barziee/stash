'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      // Force animation restart by removing and re-adding the element's animation
      const el = ref.current;
      if (el) {
        setVisible(false);
        // Wait one frame for the browser to register the "hidden" state
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setVisible(true);
          });
        });
      }
    }
  }, [pathname]);

  return (
    <div
      ref={ref}
      className={visible ? 'page-enter' : 'page-exit'}
    >
      {children}
    </div>
  );
}
