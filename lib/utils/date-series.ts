export interface DayCount {
  date: string; // 'YYYY-MM-DD'
  count: number;
}

export function fillMissingDays(input: DayCount[], startDate: string, endDate: string): DayCount[] {
  const map = new Map<string, number>();
  for (const r of input) map.set(r.date, r.count);

  const out: DayCount[] = [];
  const start = new Date(startDate + 'T00:00:00Z');
  const end = new Date(endDate + 'T00:00:00Z');
  const cursor = new Date(start);
  while (cursor <= end) {
    const iso = cursor.toISOString().slice(0, 10);
    out.push({ date: iso, count: map.get(iso) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

export function rangeToDates(range: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setUTCDate(end.getUTCDate() - (range - 1));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}
