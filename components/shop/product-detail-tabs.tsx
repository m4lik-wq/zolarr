'use client';

import * as Tabs from '@radix-ui/react-tabs';
import type { Product } from '@/lib/db/types';

interface Props {
  product: Product;
}

export function ProductDetailTabs({ product }: Props) {
  return (
    <Tabs.Root defaultValue="desc" className="mt-10">
      <Tabs.List className="flex flex-wrap gap-2 border-b border-[var(--color-border-glass)] pb-2">
        <Tabs.Trigger
          value="desc"
          className="rounded-xl px-4 py-2 font-display text-sm data-[state=active]:bg-[var(--color-brand)] data-[state=active]:text-[var(--color-bg-base)]"
        >
          Açıklama
        </Tabs.Trigger>
        <Tabs.Trigger
          value="specs"
          className="rounded-xl px-4 py-2 font-display text-sm data-[state=active]:bg-[var(--color-brand)] data-[state=active]:text-[var(--color-bg-base)]"
        >
          Teknik Özellikler
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="desc" className="prose prose-invert max-w-none pt-6 leading-relaxed">
        {product.short_description && (
          <p className="mb-4 font-medium">{product.short_description}</p>
        )}
        {product.description ? (
          <p>{product.description}</p>
        ) : (
          <p className="text-[var(--color-text-muted)]">Açıklama henüz girilmemiş.</p>
        )}
      </Tabs.Content>
      <Tabs.Content value="specs" className="pt-6">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {product.brand && <SpecRow label="Marka" value={product.brand} />}
          {product.sku && <SpecRow label="SKU" value={product.sku} />}
          {product.power_w && <SpecRow label="Güç" value={`${product.power_w} W`} />}
          {product.power_kwp && <SpecRow label="kWp" value={`${product.power_kwp}`} />}
          {product.current_a && <SpecRow label="Akım" value={`${product.current_a} A`} />}
          {product.voltage_v && <SpecRow label="Voltaj" value={`${product.voltage_v} V`} />}
          {product.warranty_years && (
            <SpecRow label="Garanti" value={`${product.warranty_years} yıl`} />
          )}
          <SpecRow label="Stok" value={`${product.stock} adet`} />
        </dl>
      </Tabs.Content>
    </Tabs.Root>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-bg-elevated)]/40 px-4 py-2">
      <dt className="text-[var(--color-text-muted)]">{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  );
}
