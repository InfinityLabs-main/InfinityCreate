// Заглушка для типов блоков, ещё не реализованных (cases/reviews/faq/cta).
// Заменяется полноценными компонентами в Спринте 1. Показывает заголовок,
// чтобы конструктор был визуально проверяем уже сейчас.
export function GenericBlock({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) ?? 'Раздел';
  const cta = props.cta as string | undefined;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="glass-panel flex flex-col items-start gap-2 p-8">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-faint">
          блок · в разработке
        </span>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {cta && <p className="text-sm text-ink-soft">Кнопка: {cta}</p>}
      </div>
    </section>
  );
}
