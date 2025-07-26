import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import './ScrollableList.css';

// Types for the ScrollableList component
export interface ScrollableListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  containerStyle?: CSSProperties;
  itemContainerStyle?: CSSProperties;
  maxHeight?: string | number;
  minHeight?: string | number;
  scrollBehavior?: 'smooth' | 'auto';
  enableVirtualization?: boolean;
  itemHeight?: number;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  onReachEnd?: () => void;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
  showScrollbar?: boolean;
  className?: string;
}

// Virtualization hook for performance optimization
const useVirtualization = (
  items: unknown[],
  containerHeight: number,
  itemHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    return { start: Math.max(0, start - overscan), end };
  }, [scrollTop, containerHeight, itemHeight, overscan, items.length]);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;
  
  return {
    visibleRange,
    totalHeight,
    offsetY,
    setScrollTop
  };
};

// ScrollableList component with SOLID principles
export const ScrollableList = <T,>({
  items,
  renderItem,
  keyExtractor,
  containerStyle = {},
  itemContainerStyle = {},
  maxHeight = '400px',
  minHeight = '200px',
  scrollBehavior = 'smooth',
  enableVirtualization = false,
  itemHeight = 60,
  overscan = 5,
  onScroll,
  onReachEnd,
  loading = false,
  emptyMessage = 'No items to display',
  emptyIcon = '📭',
  showScrollbar = true,
  className = ''
}: ScrollableListProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  
  // Measure container height
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });
      
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);
  
  // Virtualization setup
  const virtualization = useVirtualization(items, containerHeight, itemHeight, overscan);
  
  // Scroll handler with throttling
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    
    // Call onScroll callback
    onScroll?.(scrollTop);
    
    // Check if reached end
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      onReachEnd?.();
    }
    
    // Update virtualization scroll position
    if (enableVirtualization) {
      virtualization.setScrollTop(scrollTop);
    }
  }, [onScroll, onReachEnd, enableVirtualization, virtualization]);
  
  // Memoized scrollbar styles
  const scrollbarStyles = useMemo(() => {
    if (!showScrollbar) {
      return {
        scrollbarWidth: 'none' as const,
        msOverflowStyle: 'none' as const,
        '&::-webkit-scrollbar': { display: 'none' }
      };
    }
    
    return {
      scrollbarWidth: 'thin' as const,
      scrollbarColor: '#4A5568 #1A202C',
      '&::-webkit-scrollbar': {
        width: '8px'
      },
      '&::-webkit-scrollbar-track': {
        background: '#1A202C',
        borderRadius: '4px'
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#4A5568',
        borderRadius: '4px',
        '&:hover': {
          background: '#6B7280'
        }
      }
    };
  }, [showScrollbar]);
  
  // Memoized container styles
  const finalContainerStyle = useMemo(() => ({
    maxHeight,
    minHeight,
    overflowY: 'auto' as const,
    scrollBehavior,
    ...scrollbarStyles,
    ...containerStyle
  }), [maxHeight, minHeight, scrollBehavior, scrollbarStyles, containerStyle]);
  
  // Memoized items to render
  const itemsToRender = useMemo(() => {
    if (enableVirtualization) {
      return items.slice(virtualization.visibleRange.start, virtualization.visibleRange.end);
    }
    return items;
  }, [items, enableVirtualization, virtualization.visibleRange]);
  
  // Empty state
  if (items.length === 0 && !loading) {
    return (
      <div
        ref={containerRef}
        className={`scrollable-list-empty ${className}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          color: '#9CA3AF',
          fontSize: '16px',
          textAlign: 'center',
          minHeight,
          ...containerStyle
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          {emptyIcon}
        </div>
        <p style={{ margin: 0 }}>{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div
      ref={containerRef}
      className={`scrollable-list ${className}`}
      style={finalContainerStyle}
      onScroll={handleScroll}
    >
      {enableVirtualization ? (
        <div style={{ height: virtualization.totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${virtualization.offsetY}px)` }}>
            {itemsToRender.map((item, index) => {
              const actualIndex = virtualization.visibleRange.start + index;
              return (
                <div
                  key={keyExtractor(item, actualIndex)}
                  className="scrollable-list-item"
                  style={{
                    height: itemHeight,
                    ...itemContainerStyle
                  }}
                >
                  {renderItem(item, actualIndex)}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        itemsToRender.map((item, index) => (
          <div
            key={keyExtractor(item, index)}
            className="scrollable-list-item"
            style={itemContainerStyle}
          >
            {renderItem(item, index)}
          </div>
        ))
      )}
      
      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          color: '#9CA3AF'
        }}>
          <div style={{ fontSize: '24px', marginRight: '8px' }}>⏳</div>
          Loading...
        </div>
      )}
    </div>
  );
};

// Grid-based ScrollableList for card layouts
export interface ScrollableGridListProps<T> extends Omit<ScrollableListProps<T>, 'itemHeight' | 'enableVirtualization'> {
  gridTemplateColumns?: string;
  gap?: string | number;
  itemMinWidth?: string | number;
}

export const ScrollableGridList = <T,>({
  items,
  renderItem,
  keyExtractor,
  gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))',
  gap = '16px',
  itemMinWidth = '300px',
  containerStyle = {},
  itemContainerStyle = {},
  ...props
}: ScrollableGridListProps<T>) => {
  const gridContainerStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns,
    gap,
    ...containerStyle
  }), [gridTemplateColumns, gap, containerStyle]);
  
  const gridItemStyle = useMemo(() => ({
    minWidth: itemMinWidth,
    ...itemContainerStyle
  }), [itemMinWidth, itemContainerStyle]);
  
  return (
    <ScrollableList
      items={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      containerStyle={gridContainerStyle}
      itemContainerStyle={gridItemStyle}
      enableVirtualization={false} // Grid virtualization is complex, disable for now
      {...props}
    />
  );
};

// Export types for external use
export type { ScrollableListProps, ScrollableGridListProps }; 