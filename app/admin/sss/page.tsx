import Link from 'next/link';
import { listAdminFaqs } from '@/lib/db/queries/admin/faqs';
import { Button } from '@/components/ui/button';
import type { Faq } from '@/lib/db/types';

const CATEGORY_LABEL: Record<Faq['category'], string> = {
  genel: 'Genel',
  teknik: 'Teknik',
  fiyat: 'Fiyat',
  kurulum: 'Kurulum',
  garanti: 'Garanti',
};

export const dynamic = 'force-dynamic';

export default async function AdminSssPage() {
  const faqs = await listAdminFaqs();
  const groups: Record<Faq['category'], Faq[]> = {
    genel: [],
    teknik: [],
    fiyat: [],
    kurulum: [],
    garanti: [],
  };
  for (const f of faqs) groups[f.category].push(f);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Sıkça Sorulan Sorular</h1>
        <Button asChild>
          <Link href="/admin/sss/yeni">+ Yeni SSS</Link>
        </Button>
      </header>
      {Object.entries(groups).map(([cat, items]) => (
        <section key={cat} className="glass rounded-2xl p-6">
          <h2 className="mb-3 font-display text-lg font-semibold">
            {CATEGORY_LABEL[cat as Faq['category']]} ({items.length})
          </h2>
          {items.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              Bu kategoride SSS yok.
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between gap-3 border-b border-[var(--color-border-glass)] py-2 last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-sm">{f.question}</p>
                    {!f.isPublished && (
                      <span className="text-xs text-[var(--color-text-muted)]">
                        (yayında değil)
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/admin/sss/${f.id}`}
                    className="text-sm text-[var(--color-brand)] hover:underline"
                  >
                    Düzenle
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
