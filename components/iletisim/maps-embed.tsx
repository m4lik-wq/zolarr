export function MapsEmbed() {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-[var(--color-border)]">
      <iframe
        title="Zolarr ofis konumu"
        src="https://www.google.com/maps?q=Karşıyaka,İzmir&output=embed"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full"
      />
    </div>
  );
}
