import { describe, it, expect } from 'vitest';
import { cleanForSpeech } from '@/lib/utils/text-cleaner';

describe('cleanForSpeech', () => {
  it('strips emojis', () => {
    expect(cleanForSpeech('Merhaba 🔆 dünya ☀️')).toBe('Merhaba dünya');
  });

  it('strips markdown bold/italic markers', () => {
    expect(cleanForSpeech('**Kalın** ve *italik* metin')).toBe('Kalın ve italik metin');
  });

  it('strips heading markers', () => {
    expect(cleanForSpeech('# Başlık\nMetin')).toBe('Başlık. Metin');
  });

  it('replaces list markers with comma', () => {
    expect(cleanForSpeech('- Madde bir\n- Madde iki')).toBe('Madde bir, Madde iki');
  });

  it('replaces URLs with the word "link"', () => {
    expect(cleanForSpeech('Bilgi: https://example.com adresinde')).toBe('Bilgi: link adresinde');
  });

  it('collapses repeated whitespace', () => {
    expect(cleanForSpeech('iki   üç')).toBe('iki üç');
  });
});
