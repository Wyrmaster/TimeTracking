// src/Common/useElementMetrics.ts
import { useEffect, useRef, useState } from 'react';

// region Interfaces

export interface ElementMetric {
  headerSize: number;
  column: number;
  x: number;
  width: number;
  y: number;
  height: number;
}

// endregion

// region Hook

export const useElementMetrics = (deps: any[] = []) => {
  const ref = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<ElementMetric | null>(null);

  useEffect(() => {
    if (deps[2]) {
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    // Update metrics function
    const updateMetrics = () => {
      const rect = element.getBoundingClientRect();
      const parent = element.parentElement?.parentElement;

      if (parent) {
        const parentRect: DOMRect = parent.getBoundingClientRect();
        const headerRect: DOMRect |null = parent.firstElementChild?.getBoundingClientRect() ?? null;

        setMetrics({
          headerSize: headerRect?.height ?? 0,
          column: deps[0],
          x: rect.left - parentRect.left, // Relative to parent
          width: rect.width,
          y: rect.top - parentRect.top,
          height: rect.height,
        });
      }
    };

    // Initial update
    updateMetrics();

    // ResizeObserver for size changes
    const resizeObserver = new ResizeObserver(updateMetrics);
    resizeObserver.observe(element);

    // Listen to window resize
    window.addEventListener('resize', updateMetrics);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateMetrics);
    };
  }, deps);

  return { ref, metrics };
};

// endregion