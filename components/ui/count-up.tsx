'use client';

import * as React from 'react';

interface CountUpProps {
  value: number;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

export function CountUp({ value, suffix = '', durationMs = 1500, className }: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = React.useState(0);
  const [started, setStarted] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current || started) return;
    const node = ref.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDisplay(value);
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            setStarted(true);
            let start: number | null = null;
            const tick = (now: number) => {
              if (start === null) start = now;
              const elapsed = now - start;
              const progress = Math.min(Math.max(elapsed / durationMs, 0), 1);
              const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
              setDisplay(Math.round(eased * value));
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value, durationMs, started]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString('tr-TR')}
      {suffix}
    </span>
  );
}
