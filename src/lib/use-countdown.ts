'use client';

import { useEffect, useState } from 'react';

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOver: boolean;
}

/** Ticks every second toward an absolute epoch-ms deadline. */
export function useCountdown(targetMs: number): CountdownParts {
  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = Math.max(0, targetMs - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    isOver: diff === 0 && now > 0,
  };
}

export function formatCountdown(p: CountdownParts): string {
  if (p.isOver) return 'Time expired';
  const parts = [
    p.days ? `${p.days}d` : '',
    p.hours ? `${p.hours}h` : '',
    p.minutes ? `${p.minutes}m` : '',
    p.seconds ? `${p.seconds}s` : '',
  ].filter(Boolean);
  return parts.length ? parts.join(' ') : '0s';
}
