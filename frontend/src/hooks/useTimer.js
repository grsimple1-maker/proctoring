import { useState, useEffect, useRef } from 'react';

export const useTimer = (initialSeconds, onExpire) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const expiredRef = useRef(false);

  // Sync initial seconds when test changes or loads
  useEffect(() => {
    setSecondsLeft(initialSeconds);
    expiredRef.current = false;
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
      return;
    }
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft, onExpire]);

  const format = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
  };

  return { secondsLeft, formatted: format(secondsLeft) };
};
