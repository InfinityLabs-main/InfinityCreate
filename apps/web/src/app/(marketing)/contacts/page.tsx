import type { Metadata } from 'next';
import { Mail, Phone, Send } from 'lucide-react';
import { getSiteSettings } from '@/features/content/queries';
import { LeadForm } from '@/features/leads/LeadForm';
import { PageHeader } from '@/shared/ui/PageHeader';
import { JsonLd, breadcrumbLd, organizationLd } from '@/shared/seo/jsonld';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Контакты',
  description: 'Свяжитесь с нами: оставьте заявку или напишите напрямую.',
  alternates: { canonical: '/contacts' },
};

type Contacts = { email?: string; phone?: string; telegram?: string };

export default async function ContactsPage() {
  const settings = await getSiteSettings();
  const contacts = (settings.contacts as Contacts) ?? {};

  const rows = [
    contacts.email && { icon: Mail, label: contacts.email, href: `mailto:${contacts.email}` },
    contacts.phone && { icon: Phone, label: contacts.phone, href: `tel:${contacts.phone}` },
    contacts.telegram && {
      icon: Send,
      label: contacts.telegram,
      href: `https://t.me/${contacts.telegram.replace('@', '')}`,
    },
  ].filter(Boolean) as { icon: typeof Mail; label: string; href: string }[];

  return (
    <>
      <JsonLd
        data={[
          organizationLd(),
          breadcrumbLd([
            { name: 'Главная', path: '/' },
            { name: 'Контакты', path: '/contacts' },
          ]),
        ]}
      />
      <PageHeader
        eyebrow="Связь"
        title="Обсудим ваш проект"
        description="Оставьте заявку — менеджер свяжется и уточнит детали. Или напишите нам напрямую."
        crumbs={[
          { name: 'Главная', path: '/' },
          { name: 'Контакты', path: '/contacts' },
        ]}
      />
      <div className="mx-auto grid max-w-5xl gap-8 px-6 pb-20 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Прямые контакты</h2>
          <div className="mt-5 flex flex-col gap-3">
            {rows.map((r) => (
              <a
                key={r.href}
                href={r.href}
                className="flex items-center gap-3 rounded-xl border border-hair/20 bg-panel px-4 py-3 text-ink-soft transition-colors hover:border-accent/40 hover:text-ink"
              >
                <r.icon size={18} className="text-accent" />
                {r.label}
              </a>
            ))}
          </div>
          <p className="mt-6 text-sm text-ink-faint">
            Рабочее общение по проектам ведётся в чате личного кабинета — с историей,
            вложениями и статусами.
          </p>
        </div>
        <LeadForm />
      </div>
    </>
  );
}
