'use client';

import { useEffect, useMemo, useState } from 'react';

type Message = {
  id: string;
  sender: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
  deletionAt?: string | null;
};

type MessageListProps = {
  initialMessages: Message[];
};

export function MessageList({ initialMessages }: MessageListProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const visibleMessages = useMemo(
    () =>
      initialMessages.filter((message) => {
        if (!message.deletionAt) {
          return true;
        }
        return new Date(message.deletionAt) > now;
      }),
    [initialMessages, now]
  );

  return (
    <div className="message-list">
      {visibleMessages.length === 0 ? (
        <p className="message-list__empty">No active messages.</p>
      ) : (
        visibleMessages.map((message) => {
          const deletionDate = message.deletionAt
            ? new Date(message.deletionAt)
            : undefined;
          return (
            <article key={message.id} className="message-card">
              <header className="message-card__header">
                <strong>{message.sender}</strong>
                <span className="message-card__timestamp">{message.createdAt}</span>
              </header>
              <p className="message-card__body">{message.body}</p>
              {message.readAt && (
                <p className="message-card__meta">Read at {message.readAt}</p>
              )}
              {deletionDate && (
                <p className="message-card__meta">
                  Expires at {deletionDate.toLocaleTimeString()}
                </p>
              )}
            </article>
          );
        })
      )}
    </div>
  );
}
