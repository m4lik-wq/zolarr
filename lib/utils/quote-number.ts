const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 0/1/I/O/L excluded for legibility

export type NumberPrefix = 'ZQT' | 'ZLR';

export function generateQuoteNumber(prefix: NumberPrefix): string {
  const year = new Date().getFullYear();
  let suffix = '';
  for (let i = 0; i < 5; i++) {
    const idx = Math.floor(Math.random() * ALPHABET.length);
    suffix += ALPHABET[idx];
  }
  return `${prefix}-${year}-${suffix}`;
}
