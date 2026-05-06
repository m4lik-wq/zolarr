export default function Loading() {
  return (
    <div className="container mx-auto grid gap-6 px-4 py-10 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block">
        <div className="h-64 animate-pulse rounded-2xl bg-[var(--color-bg-elevated)]" />
      </aside>
      <div className="space-y-4">
        <div className="h-10 animate-pulse rounded-2xl bg-[var(--color-bg-elevated)]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-2xl bg-[var(--color-bg-elevated)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
