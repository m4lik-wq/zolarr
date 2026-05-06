export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-[var(--color-bg-elevated)]" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-[var(--color-bg-elevated)]" />
        ))}
      </div>
    </div>
  );
}
