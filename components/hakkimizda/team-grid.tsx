import Image from 'next/image';
import { TEAM_MOCK } from '@/lib/data/team-mock';

export function TeamGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {TEAM_MOCK.map((m) => (
        <div key={m.name} className="text-center">
          <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full border-2 border-[var(--color-brand)]/30">
            <Image src={m.photo} alt={m.name} fill sizes="128px" className="object-cover" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold">{m.name}</h3>
          <p className="text-sm text-[var(--color-brand)]">{m.title}</p>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{m.bio}</p>
        </div>
      ))}
    </div>
  );
}
