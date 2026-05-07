export interface ProductSeed {
  name: string;
  brand: string | null;
  price: number;
  warrantyYears: number | null;
  shortDescription: string | null;
  description: string | null;
  category: string | null;
}

export interface ProjectSeed {
  title: string;
  type: 'konut' | 'ticari' | 'tarim';
  location: string;
  capacityKwp: number;
  description: string | null;
}

export interface FaqSeed {
  question: string;
  answer: string;
  category: string;
}

export function productToText(p: ProductSeed): string {
  const parts: string[] = [`Ürün: ${p.name}`];
  if (p.category) parts.push(`Kategori: ${p.category}`);
  if (p.brand) parts.push(`Marka: ${p.brand}`);
  parts.push(`Fiyat: ${p.price} TL`);
  if (p.warrantyYears !== null) parts.push(`Garanti: ${p.warrantyYears} yıl`);
  if (p.shortDescription) parts.push(`Özet: ${p.shortDescription}`);
  if (p.description) parts.push(`Detay: ${p.description}`);
  return parts.join('\n');
}

export function projectToText(p: ProjectSeed): string {
  const parts: string[] = [
    `Proje: ${p.title}`,
    `Konum: ${p.location}`,
    `Tip: ${p.type}`,
    `Kapasite: ${p.capacityKwp} kWp`,
  ];
  if (p.description) parts.push(`Detay: ${p.description}`);
  return parts.join('\n');
}

export function faqToText(f: FaqSeed): string {
  return `Soru: ${f.question}\nCevap: ${f.answer}\nKategori: ${f.category}`;
}
