import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimerOptions {
  timeout: number; // в миллисекундах
  onIdle: () => void;
  events?: string[];
}

export const useIdleTimer = ({ 
  timeout, 
  onIdle, 
  events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'] 
}: UseIdleTimerOptions) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onIdle();
    }, timeout);
  }, [timeout, onIdle]);

  useEffect(() => {
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [events, resetTimer]);

  return { resetTimer };
};
