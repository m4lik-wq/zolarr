export interface MockFaq {
  question: string;
  answer: string;
}

export const FAQ_MOCK: MockFaq[] = [
  { question: 'Çatımda güneş paneli için yeterli alan var mı?', answer: '1 kWp sistem yaklaşık 5–6 m² alana ihtiyaç duyar. 10 kWp\'lik bir konut sistemi 50–60 m² çatı alanı ister. Ücretsiz keşif ile sizin çatınız için net rakam veriyoruz.' },
  { question: 'Geri ödeme süresi ne kadar?', answer: 'Türkiye\'de ortalama 4–6 yıldır. Konut, fatura tutarına ve bölgeye göre değişir; ticari işletmelerde KDV avantajı sayesinde 3–4 yıla iner.' },
  { question: 'Bulutlu havalarda sistem çalışır mı?', answer: 'Evet, sistem yağmurlu/bulutlu havada da düşük verimle çalışmaya devam eder. Yıllık ortalama üretim hesabı bu koşulları içerir.' },
  { question: 'Bakım gerekiyor mu?', answer: 'Yılda 1–2 kez panel temizliği yeterlidir. İnvertör ve bağlantı kontrolünü 2 yılda bir uzman bakım ekibimiz ücretsiz yapıyor (garanti süresince).' },
  { question: 'Devletten teşvik var mı?', answer: 'Mesken aboneliklerinde 10 kW\'a kadar mahsuplaşma uygulanır. Ticari sistemlerde KDV %1, ek olarak yatırım teşvik belgesi alınabilir. Detaylı bilgilendirmeyi teklif sürecinde sunuyoruz.' },
];
