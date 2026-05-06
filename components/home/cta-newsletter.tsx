import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NewsletterForm } from '@/components/ui/newsletter-form';

export function CtaNewsletter() {
  return (
    <section className="border-t border-[var(--color-border-glass)] bg-gradient-to-br from-[var(--color-bg-elevated)] to-[var(--color-bg-base)] py-16" aria-labelledby="cta-heading">
      <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4">
          <h2 id="cta-heading" className="font-display text-3xl font-bold sm:text-4xl">
            Faturanızdan kurtulmak için <span className="text-[var(--color-brand)]">bugün</span> başlayın.
          </h2>
          <p className="max-w-xl text-[var(--color-text-muted)]">
            Ücretsiz keşif ve teklif sürecimiz 24 saat içinde başlar. Yatırımınız ortalama 4-6 yılda
            kendini öder, sonrasında 25 yıl kâra geçer.
          </p>
          <Button asChild size="lg">
            <Link href="/teklif/al">
              Ücretsiz Teklif Al
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        <div className="glass space-y-3 rounded-2xl p-6">
          <h3 className="font-display text-xl font-semibold">Gelişmelerden haberdar olun</h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            Yeni kampanyalar ve enerji ipuçları için bültenimize abone olun. (Pazarlama metni KVKK kapsamındadır; istediğiniz zaman çıkabilirsiniz.)
          </p>
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
