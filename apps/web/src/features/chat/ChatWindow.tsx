'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { Send, Paperclip } from 'lucide-react';
import { sendMessage, markTicketRead, type SerializedMessage } from './actions';
import { presignUpload } from './upload-actions';
import { mintSocketToken } from './socket-token';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';

type Props = {
  ticketId: string;
  currentUserId: string;
  initialMessages: SerializedMessage[];
  realtimeUrl: string;
};

function timeLabel(iso: string) {
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  );
}

export function ChatWindow({ ticketId, currentUserId, initialMessages, realtimeUrl }: Props) {
  const [messages, setMessages] = useState<SerializedMessage[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [peerTyping, setPeerTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Подключение сокета с коротким токеном; переподключение обновляет токен.
  useEffect(() => {
    let active = true;
    let socket: Socket | null = null;

    (async () => {
      const token = await mintSocketToken();
      if (!active) return;

      socket = io(realtimeUrl, { auth: { token }, path: '/socket.io' });
      socketRef.current = socket;

      socket.on('connect', () => {
        setConnected(true);
        socket?.emit('ticket:join', ticketId);
      });
      socket.on('disconnect', () => setConnected(false));

      // Обновляем токен при реконнекте (старый живёт 60с).
      socket.io.on('reconnect_attempt', async () => {
        const fresh = await mintSocketToken();
        if (socket) socket.auth = { token: fresh };
      });

      socket.on('message:new', (payload: { message?: SerializedMessage }) => {
        // Ретрансляция от собеседника: добавляем, если это не наше эхо.
        if (payload.message && payload.message.authorId !== currentUserId) {
          setMessages((prev) =>
            prev.some((m) => m.id === payload.message!.id) ? prev : [...prev, payload.message!],
          );
        }
      });

      socket.on('typing', (p: { userId: string }) => {
        if (p.userId !== currentUserId) {
          setPeerTyping(true);
          if (typingTimeout.current) clearTimeout(typingTimeout.current);
          typingTimeout.current = setTimeout(() => setPeerTyping(false), 2500);
        }
      });
    })();

    return () => {
      active = false;
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [ticketId, realtimeUrl, currentUserId]);

  // Прокрутка вниз при новом сообщении + отметка прочтения.
  useEffect(() => {
    scrollToBottom();
    void markTicketRead(ticketId);
  }, [messages, ticketId, scrollToBottom]);

  function handleTyping() {
    socketRef.current?.emit('typing', { ticketId });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      // 1. presign (валидация MIME/размера на сервере)
      const pre = await presignUpload({ mime: file.type, size: file.size });
      if (!pre.ok) {
        setUploadError(pre.error);
        return;
      }
      // 2. прямая загрузка в S3 по presigned URL
      const put = await fetch(pre.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!put.ok) {
        setUploadError('Не удалось загрузить файл.');
        return;
      }
      // 3. отправляем сообщение с вложением
      const result = await sendMessage({
        ticketId,
        body: draft.trim() || `Файл: ${file.name}`,
        mediaKeys: [pre.key],
      });
      if (result.ok) {
        setMessages((prev) => [...prev, result.message]);
        setDraft('');
        socketRef.current?.emit('message:new', { ticketId, message: result.message });
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);

    const result = await sendMessage({ ticketId, body });
    if (result.ok) {
      setMessages((prev) => [...prev, result.message]);
      setDraft('');
      // Ретранслируем собеседнику через сокет.
      socketRef.current?.emit('message:new', { ticketId, message: result.message });
    }
    setSending(false);
  }

  return (
    <div className="glass-panel flex h-[calc(100vh-13rem)] flex-col overflow-hidden">
      {/* Заголовок */}
      <div className="flex items-center justify-between border-b border-hair/15 px-5 py-3">
        <div>
          <p className="font-medium">Чат с поддержкой</p>
          <p className="text-xs text-ink-faint">
            {connected ? 'на связи' : 'подключение…'}
          </p>
        </div>
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            connected ? 'bg-ok' : 'bg-ink-faint/50',
          )}
        />
      </div>

      {/* Лента */}
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-ink-faint">
            Напишите первое сообщение — менеджер ответит здесь.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.authorId === currentUserId;
          return (
            <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                  mine
                    ? 'bg-accent-gradient text-white'
                    : 'border border-hair/20 bg-panel text-ink',
                )}
              >
                {!mine && (
                  <p className="mb-0.5 text-xs font-medium opacity-70">
                    {m.authorName ?? 'Поддержка'}
                  </p>
                )}
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                {m.media.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1">
                    {m.media.map((f) => (
                      <a
                        key={f.id}
                        href={`/api/media/${encodeURIComponent(f.key)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs underline underline-offset-2 opacity-90 hover:opacity-100"
                      >
                        <Paperclip size={12} /> вложение ({(f.size / 1024).toFixed(0)} КБ)
                      </a>
                    ))}
                  </div>
                )}
                <p className={cn('mt-1 text-right text-[10px]', mine ? 'text-white/70' : 'text-ink-faint')}>
                  {timeLabel(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        {peerTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-hair/20 bg-panel px-4 py-2 text-sm text-ink-faint">
              печатает…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Ввод */}
      <div className="border-t border-hair/15">
        {uploadError && (
          <p className="px-4 pt-2 text-xs text-risk">{uploadError}</p>
        )}
        <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3">
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={handleFile}
            accept="image/*,application/pdf,application/zip,text/plain"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            aria-label="Прикрепить файл"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-hair/30 text-ink-soft transition-colors hover:border-accent/50 hover:text-ink disabled:opacity-50"
          >
            <Paperclip size={16} />
          </button>
          <input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              handleTyping();
            }}
            placeholder={uploading ? 'Загрузка файла…' : 'Сообщение…'}
            disabled={uploading}
            className="flex-1 rounded-xl border border-hair/30 bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent/60"
          />
          <Button type="submit" disabled={sending || uploading || !draft.trim()} className="px-3">
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}
