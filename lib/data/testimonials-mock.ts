export interface MockTestimonial {
  name: string;
  role: string;
  city: string;
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

export const TESTIMONIALS_MOCK: MockTestimonial[] = [
  { name: 'Mehmet Y.', role: 'Konut sahibi', city: 'Antalya', quote: 'Faturam 1200 TL\'den 110 TL\'ye indi. Kurulum 2 günde bitti, ekip son derece profesyoneldi.', rating: 5 },
  { name: 'Ayşe K.', role: 'KOBİ sahibi', city: 'Konya', quote: 'Fabrikamız için 250kW sistem kurduk; geri ödeme süresini 4 yılda kapatacağız. Mühendislik desteği harika.', rating: 5 },
  { name: 'Hasan D.', role: 'Çiftçi', city: 'Şanlıurfa', quote: 'Tarımsal sulamada elektrik faturası kalmadı. Pompa sistemi sorunsuz çalışıyor.', rating: 5 },
  { name: 'Zeynep T.', role: 'Konut sahibi', city: 'İzmir', quote: 'Online teklif sürecinden kuruluma kadar her şey şeffaftı. Kesinlikle tavsiye ediyorum.', rating: 5 },
  { name: 'Ali R.', role: 'Otel işletmecisi', city: 'Muğla', quote: '180kW sistemimiz yazın tüm ihtiyacımızı karşılıyor. 7/24 destek hattı her zaman ulaşılabilir.', rating: 5 },
];
