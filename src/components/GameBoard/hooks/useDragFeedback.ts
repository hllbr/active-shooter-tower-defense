import { useState, useCallback, useRef, useEffect } from 'react';
import type { DragFeedback } from '../types';

export const useDragFeedback = () => {
  const [feedback, setFeedback] = useState<DragFeedback | null>(null);
  const feedbackTimeoutRef = useRef<number | undefined>(undefined);

  const showFeedback = useCallback((
    message: string, 
    type: DragFeedback['type'], 
    position: { x: number; y: number }, 
    duration = 3000
  ) => {
    const newFeedback: DragFeedback = {
      message,
      type,
      duration,
      showAt: position
    };
    
    setFeedback(newFeedback);
    
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
    }, duration);
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  return {
    feedback,
    showFeedback,
    clearFeedback
  };
}; 