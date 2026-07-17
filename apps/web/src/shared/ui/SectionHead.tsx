import Link from 'next/link';

// Шапка секции в стиле макета: слева eyebrow + display-заголовок,
// справа — моно-ссылка «более →».
export function SectionHead({
  eyebrow,
  title,
  moreHref,
  moreLabel,
}: {
  eyebrow: string;
  title: string;
  moreHref?: string;
  moreLabel?: string;
}) {
  return (
    <div className="mb-11 flex flex-wrap items-end justify-between gap-6">
      <div>
        <span className="eyebrow mb-4">{eyebrow}</span>
        <h2 className="font-display text-[clamp(2rem,3.4vw,2.9rem)] font-bold tracking-tight">
          {title}
        </h2>
      </div>
      {moreHref && (
        <Link href={moreHref} className="more-link">
          {moreLabel ?? 'подробнее'} →
        </Link>
      )}
    </div>
  );
}
