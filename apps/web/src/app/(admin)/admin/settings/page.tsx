import type { Metadata } from 'next';
import { requireRole } from '@/shared/auth/session';
import { getSiteSettings } from '@/features/content/queries';
import { saveSettings } from '@/features/admin/content-actions';
import { AdminHeader } from '@/features/admin/ui';
import { Button } from '@/shared/ui/Button';

export const metadata: Metadata = { title: 'Админка · Настройки', robots: { index: false } };

const field =
  'w-full rounded-xl border border-hair/30 bg-panel px-4 py-2.5 text-sm outline-none focus:border-accent/60';
const label = 'font-mono text-xs uppercase tracking-wide text-ink-faint';

function SettingGroup({
  groupKey,
  title,
  fields,
  values,
}: {
  groupKey: string;
  title: string;
  fields: { name: string; label: string }[];
  values: Record<string, unknown>;
}) {
  return (
    <form
      action={saveSettings}
      className="rounded-card border border-hair/15 bg-panel p-6 shadow-card"
    >
      <input type="hidden" name="__key" value={groupKey} />
      <h2 className="mb-4 text-lg font-semibold tracking-tight">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className="flex flex-col gap-1.5">
            <label className={label}>{f.label}</label>
            <input
              name={f.name}
              defaultValue={String(values[f.name] ?? '')}
              className={field}
            />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Button type="submit">Сохранить</Button>
      </div>
    </form>
  );
}

export default async function AdminSettingsPage() {
  await requireRole('ADMIN');
  const settings = await getSiteSettings();
  const general = (settings.general as Record<string, unknown>) ?? {};
  const contacts = (settings.contacts as Record<string, unknown>) ?? {};
  const socials = (settings.socials as Record<string, unknown>) ?? {};
  const seo = (settings.seo as Record<string, unknown>) ?? {};

  return (
    <div>
      <AdminHeader title="Настройки сайта" description="Название, контакты, соцсети, SEO." />
      <div className="space-y-6">
        <SettingGroup
          groupKey="general"
          title="Основное"
          values={general}
          fields={[
            { name: 'name', label: 'Название' },
            { name: 'tagline', label: 'Слоган' },
          ]}
        />
        <SettingGroup
          groupKey="contacts"
          title="Контакты"
          values={contacts}
          fields={[
            { name: 'email', label: 'Email' },
            { name: 'phone', label: 'Телефон' },
            { name: 'telegram', label: 'Telegram' },
          ]}
        />
        <SettingGroup
          groupKey="socials"
          title="Социальные сети"
          values={socials}
          fields={[
            { name: 'telegram', label: 'Telegram URL' },
            { name: 'github', label: 'GitHub URL' },
            { name: 'vk', label: 'VK URL' },
          ]}
        />
        <SettingGroup
          groupKey="seo"
          title="SEO по умолчанию"
          values={seo}
          fields={[
            { name: 'defaultTitle', label: 'Title' },
            { name: 'defaultDescription', label: 'Description' },
          ]}
        />
      </div>
    </div>
  );
}
