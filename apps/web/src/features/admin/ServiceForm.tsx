import { Button } from '@/shared/ui/Button';

type Category = { id: string; title: string };
type ServiceData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  categoryId: string;
  priceFrom: number;
  durationDays: number;
  description: unknown;
  advantages: unknown;
  stages: unknown;
  faq: unknown;
  techStack: string[];
  seoTitle: string | null;
  seoDescription: string | null;
};

const field =
  'w-full rounded-xl border border-hair/30 bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent/60';
const label = 'font-mono text-xs uppercase tracking-wide text-ink-faint';

function descText(v: unknown): string {
  if (typeof v === 'string') return v;
  const b = v as { blocks?: { text?: string }[] } | null;
  return b?.blocks?.map((x) => x.text ?? '').join('\n\n') ?? '';
}
function listText(v: unknown): string {
  return Array.isArray(v) ? (v as string[]).join('\n') : '';
}
function faqText(v: unknown): string {
  if (!Array.isArray(v)) return '';
  return (v as { q: string; a: string }[]).map((f) => `${f.q} | ${f.a}`).join('\n');
}

// Единая форма услуги для создания и редактирования. Server Action передаётся
// снаружи (createService / updateService).
export function ServiceForm({
  action,
  categories,
  service,
}: {
  action: (formData: FormData) => void;
  categories: Category[];
  service?: ServiceData;
}) {
  return (
    <form action={action} className="grid gap-5 lg:grid-cols-2">
      {service && <input type="hidden" name="id" value={service.id} />}

      <div className="flex flex-col gap-1.5">
        <label className={label}>Название</label>
        <input name="title" required defaultValue={service?.title} className={field} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={label}>ЧПУ (slug)</label>
        <input
          name="slug"
          required
          pattern="[a-z0-9\-]+"
          defaultValue={service?.slug}
          placeholder="telegram-bot"
          className={field}
        />
      </div>

      <div className="flex flex-col gap-1.5 lg:col-span-2">
        <label className={label}>Краткое описание</label>
        <input name="excerpt" required defaultValue={service?.excerpt} className={field} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={label}>Категория</label>
        <select name="categoryId" required defaultValue={service?.categoryId} className={field}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={label}>Цена от, ₽</label>
          <input
            name="priceFromRub"
            type="number"
            min="0"
            required
            defaultValue={service ? Math.round(service.priceFrom / 100) : ''}
            className={field}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={label}>Срок, дней</label>
          <input
            name="durationDays"
            type="number"
            min="1"
            required
            defaultValue={service?.durationDays}
            className={field}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 lg:col-span-2">
        <label className={label}>Полное описание</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={service ? descText(service.description) : ''}
          className={`${field} resize-y`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={label}>Преимущества (по одному на строку)</label>
        <textarea
          name="advantages"
          rows={4}
          defaultValue={service ? listText(service.advantages) : ''}
          className={`${field} resize-y`}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={label}>Этапы (по одному на строку)</label>
        <textarea
          name="stages"
          rows={4}
          defaultValue={service ? listText(service.stages) : ''}
          className={`${field} resize-y`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={label}>Технологии (через запятую)</label>
        <input
          name="techStack"
          defaultValue={service ? service.techStack.join(', ') : ''}
          className={field}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={label}>FAQ (формат: вопрос | ответ)</label>
        <textarea
          name="faq"
          rows={3}
          defaultValue={service ? faqText(service.faq) : ''}
          className={`${field} resize-y`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={label}>SEO title</label>
        <input name="seoTitle" defaultValue={service?.seoTitle ?? ''} className={field} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={label}>SEO description</label>
        <input
          name="seoDescription"
          defaultValue={service?.seoDescription ?? ''}
          className={field}
        />
      </div>

      <div className="lg:col-span-2">
        <Button type="submit">{service ? 'Сохранить' : 'Создать услугу'}</Button>
      </div>
    </form>
  );
}
