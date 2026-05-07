import { describe, it, expect } from 'vitest';
import { fillMissingDays } from '@/lib/utils/date-series';

describe('fillMissingDays', () => {
  it('fills gaps with zero count', () => {
    const data = [
      { date: '2026-05-01', count: 3 },
      { date: '2026-05-03', count: 5 },
    ];
    const result = fillMissingDays(data, '2026-05-01', '2026-05-03');
    expect(result).toEqual([
      { date: '2026-05-01', count: 3 },
      { date: '2026-05-02', count: 0 },
      { date: '2026-05-03', count: 5 },
    ]);
  });

  it('returns continuous range when input is empty', () => {
    const result = fillMissingDays([], '2026-05-01', '2026-05-03');
    expect(result).toHaveLength(3);
    expect(result.every((r) => r.count === 0)).toBe(true);
  });

  it('preserves order even when input dates are unsorted', () => {
    const data = [
      { date: '2026-05-03', count: 5 },
      { date: '2026-05-01', count: 3 },
    ];
    const result = fillMissingDays(data, '2026-05-01', '2026-05-03');
    expect(result.map((r) => r.date)).toEqual(['2026-05-01', '2026-05-02', '2026-05-03']);
  });

  it('handles single-day range', () => {
    const result = fillMissingDays([{ date: '2026-05-01', count: 7 }], '2026-05-01', '2026-05-01');
    expect(result).toEqual([{ date: '2026-05-01', count: 7 }]);
  });
});
