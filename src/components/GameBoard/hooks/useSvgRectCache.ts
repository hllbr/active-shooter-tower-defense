import { useRef, useCallback, useEffect } from 'react';

export const useSvgRectCache = () => {
  const svgRectCache = useRef<DOMRect | null>(null);
  const svgElementRef = useRef<SVGElement | null>(null);

  const updateSvgRectCache = useCallback(() => {
    if (svgElementRef.current) {
      svgRectCache.current = svgElementRef.current.getBoundingClientRect();
    }
  }, []);

  const getSvgRect = useCallback((svgElement: SVGElement): DOMRect => {
    if (svgElementRef.current !== svgElement) {
      svgElementRef.current = svgElement;
      updateSvgRectCache();
    }
    
    return svgRectCache.current || svgElement.getBoundingClientRect();
  }, [updateSvgRectCache]);

  // Update cache on window resize
  useEffect(() => {
    const handleResize = () => {
      updateSvgRectCache();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateSvgRectCache]);

  return {
    getSvgRect,
    updateSvgRectCache
  };
}; 