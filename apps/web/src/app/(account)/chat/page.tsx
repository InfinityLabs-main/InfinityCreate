import type { Metadata } from 'next';
import { MessageSquare } from 'lucide-react';

export const metadata: Metadata = { title: 'Чат', robots: { index: false } };

// Полноценный realtime-чат (вложения, статусы прочтения, «печатает…»)
// реализуется в Спринте 4 поверх готового Socket.IO-сервиса.
export default function ChatPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Чат с поддержкой</h1>
      <div className="glass-panel mt-6 flex flex-col items-center gap-3 p-12 text-center">
        <MessageSquare className="text-ink-faint" size={32} />
        <p className="max-w-sm text-ink-soft">
          Онлайн-чат с менеджером — вложения, статусы прочтения, уведомления — появится
          здесь в ближайшем обновлении.
        </p>
      </div>
    </div>
  );
}
