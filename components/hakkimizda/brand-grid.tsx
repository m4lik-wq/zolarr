import Image from 'next/image';
import { BRANDS_MOCK } from '@/lib/data/brands-mock';

export function BrandGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {BRANDS_MOCK.map((b) => (
        <div
          key={b.name}
          className="glass flex aspect-[3/2] items-center justify-center rounded-2xl p-4"
        >
          <div className="relative h-12 w-full">
            <Image src={b.logo} alt={b.name} fill className="object-contain" />
          </div>
        </div>
      ))}
    </div>
  );
}
