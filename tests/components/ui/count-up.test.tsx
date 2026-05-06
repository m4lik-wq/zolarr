import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CountUp } from '@/components/ui/count-up';

describe('CountUp', () => {
  beforeEach(() => {
    // IntersectionObserver mock — fire 'inView' immediately
    class IO {
      callback: IntersectionObserverCallback;
      constructor(cb: IntersectionObserverCallback) {
        this.callback = cb;
      }
      observe(el: Element) {
        this.callback(
          [{ isIntersecting: true, target: el } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver
        );
      }
      disconnect() {}
      unobserve() {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
      root = null;
      rootMargin = '';
      thresholds = [];
    }
    vi.stubGlobal('IntersectionObserver', IO);
  });

  it('renders the final value once visible', async () => {
    render(<CountUp value={42} suffix=" MW" />);
    expect(await screen.findByText(/42\s*MW/, undefined, { timeout: 2500 })).toBeInTheDocument();
  });

  it('renders 0 initially when not intersecting', () => {
    class StaticIO {
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = '';
      thresholds = [];
    }
    vi.stubGlobal('IntersectionObserver', StaticIO);
    render(<CountUp value={42} suffix=" MW" />);
    expect(screen.getByText(/0\s*MW/)).toBeInTheDocument();
  });
});
