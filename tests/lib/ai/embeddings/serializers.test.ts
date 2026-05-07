import { describe, it, expect } from 'vitest';
import { productToText, projectToText, faqToText } from '@/lib/ai/embeddings/serializers';

describe('productToText', () => {
  it('includes name and key fields', () => {
    const t = productToText({
      name: 'Solar Panel 540W',
      brand: 'Trina',
      price: 12500,
      warrantyYears: 25,
      shortDescription: 'Yüksek verim',
      description: 'Detaylı açıklama',
      category: 'Paneller',
    });
    expect(t).toContain('Solar Panel 540W');
    expect(t).toContain('Trina');
    expect(t).toContain('25');
    expect(t).toContain('12500');
    expect(t).toContain('Paneller');
  });
  it('handles null brand and warranty gracefully', () => {
    const t = productToText({
      name: 'X',
      brand: null,
      price: 100,
      warrantyYears: null,
      shortDescription: null,
      description: null,
      category: null,
    });
    expect(t).toContain('X');
    expect(t).toContain('100');
    expect(t).not.toContain('null');
  });
});

describe('projectToText', () => {
  it('includes title + capacity + location', () => {
    const t = projectToText({
      title: 'İstanbul Çatı Kurulumu',
      type: 'konut',
      location: 'İstanbul',
      capacityKwp: 5.4,
      description: null,
    });
    expect(t).toContain('İstanbul');
    expect(t).toContain('5.4');
    expect(t).toContain('konut');
  });
});

describe('faqToText', () => {
  it('includes question + answer + category', () => {
    const t = faqToText({
      question: 'Garantisi kaç yıl?',
      answer: '25 yıl',
      category: 'garanti',
    });
    expect(t).toContain('Garantisi kaç yıl');
    expect(t).toContain('25 yıl');
    expect(t).toContain('garanti');
  });
});
