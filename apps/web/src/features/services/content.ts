import { z } from 'zod';

// Json-поля услуги имеют свободную форму в БД; парсим безопасно к UI-типам.
// Толерантно к отсутствию/мусору — витрина не должна падать из-за контента.

const faqSchema = z.array(z.object({ q: z.string(), a: z.string() })).catch([]);
const stringArraySchema = z.array(z.string()).catch([]);

export function parseFaq(value: unknown): { q: string; a: string }[] {
  return faqSchema.parse(value ?? []);
}

export function parseStringList(value: unknown): string[] {
  return stringArraySchema.parse(value ?? []);
}

// description хранится как { blocks: [{ type:'text', text }] } либо строка.
export function parseDescription(value: unknown): string {
  if (typeof value === 'string') return value;
  const parsed = z
    .object({ blocks: z.array(z.object({ type: z.string(), text: z.string() })) })
    .safeParse(value);
  if (parsed.success) {
    return parsed.data.blocks.map((b) => b.text).join('\n\n');
  }
  return '';
}
