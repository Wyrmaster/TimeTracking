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

/**
 * A custom hook that provides metrics for a referenced `<div>` element, including its positional
 * and size information relative to its parent container, as well as additional data such as
 * the height of the parent's header element and a column identifier from dependencies.
 *
 * @param {any[]} [deps=[]] - An array of dependencies used to control the re-evaluation of the effect.
 *                            The first dependency (`deps[0]`) is used as the column identifier.
 *                            If the third dependency (`deps[2]`) is truthy, the hook will terminate early
 *                            without updating metrics or attaching observers.
 *
 * @returns {{ ref: React.RefObject<HTMLDivElement>, metrics: ElementMetric | null }}
 *          - `ref`: A React ref object to be attached to a `<div>` element for measurement.
 *          - `metrics`: The measured metrics for the referenced element, which include:
 *              - `headerSize`: The height of the header element within the parent container (if present).
 *              - `column`: The column information provided by `deps[0]`.
 *              - `x`: The horizontal position of the element relative to its parent container.
 *              - `y`: The vertical position of the element relative to its parent container.
 *              - `width`: The width of the element.
 *              - `height`: The height of the element.
 */
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

    /**
     * Updates the metrics of a specified element and its parent, calculating properties
     * such as position, size, and offsets relative to the parent element.
     *
     * Retrieves the bounding rectangle of the element and its parent to compute the
     * position (x, y), size (width, height), and additional header size if applicable.
     * The metrics are then stored or updated using the `setMetrics` function.
     *
     * The method relies on the DOM structure and assumes the presence of a parent for
     * the target element. If the parent or header element is not available, certain
     * properties default to 0 or null.
     *
     * Metrics calculated:
     * - `headerSize`: Height of the first child of the parent element, if present.
     * - `column`: External dependency passed in via `deps`, representing a column.
     * - `x`: Horizontal offset of the element relative to its parent.
     * - `width`: Width of the element.
     * - `y`: Vertical offset of the element relative to its parent.
     * - `height`: Height of the element.
     */
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