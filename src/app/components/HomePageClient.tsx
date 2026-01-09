'use client';

import { useCallback, useMemo, useState } from 'react';

import { ContactSearch } from './ContactSearch';
import { MessageList } from './MessageList';

type RequestStatus = 'pending' | 'accepted' | 'rejected';

type IncomingRequest = {
  id: string;
  name: string;
  phone: string;
  email: string;
  note: string;
  sentAt: string;
  status: RequestStatus;
};

type Toast = {
  id: string;
  message: string;
  tone: 'info' | 'positive' | 'negative';
};

const initialIncomingRequests: IncomingRequest[] = [
  {
    id: 'req-902',
    name: 'Ava Carter',
    phone: '+1 (415) 555-0123',
    email: 'ava.carter@example.com',
    note: 'Hi! I met you at the robotics camp and would love to stay in touch.',
    sentAt: '2 hours ago',
    status: 'pending',
  },
  {
    id: 'req-903',
    name: 'Mateo Silva',
    phone: '+1 (312) 555-0198',
    email: 'mateo.silva@example.com',
    note: 'Can we connect for the upcoming science fair project?',
    sentAt: 'Yesterday',
    status: 'rejected',
  },
];

const initialMessages = [
  {
    id: 'msg-500',
    sender: 'Ava Carter',
    body: 'I just read your note! Reply soon?',
    createdAt: 'Just now',
    readAt: new Date().toLocaleTimeString(),
    deletionAt: new Date(Date.now() + 30000).toISOString(),
  },
  {
    id: 'msg-501',
    sender: 'Mateo Silva',
    body: 'The science fair team is ready whenever you are.',
    createdAt: '5 minutes ago',
  },
  {
    id: 'msg-502',
    sender: 'Coach Kim',
    body: 'Practice starts in 10 minutes. See you there!',
    createdAt: '10 minutes ago',
    readAt: new Date().toLocaleTimeString(),
    deletionAt: new Date(Date.now() - 10000).toISOString(),
  },
];

const currentUser = {
  id: 'user-700',
  name: 'Jordan Lee',
  phone: '+1 (415) 555-0101',
};

const statusLabels: Record<RequestStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export function HomePageClient() {
  const [incomingRequests, setIncomingRequests] = useState(initialIncomingRequests);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, tone: Toast['tone']) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const pendingCount = useMemo(
    () => incomingRequests.filter((request) => request.status === 'pending').length,
    [incomingRequests]
  );

  const handleRequestAction = useCallback(
    (requestId: string, status: RequestStatus) => {
      setIncomingRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? { ...request, status } : request
        )
      );
      const toneMap: Record<RequestStatus, Toast['tone']> = {
        pending: 'info',
        accepted: 'positive',
        rejected: 'negative',
      };
      addToast(
        status === 'accepted'
          ? 'Contact request accepted.'
          : 'Contact request rejected.',
        toneMap[status]
      );
    },
    [addToast]
  );

  const handleSendRequest = useCallback(() => {
    addToast('Contact request sent.', 'info');
  }, [addToast]);

  return (
    <>
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast--${toast.tone}`}
            role="status"
          >
            {toast.message}
          </div>
        ))}
      </div>
      <main className="page">
        <section className="card card--wide">
          <header className="card__header">
            <div>
              <p className="eyebrow">Contacts</p>
              <h1>Find your accepted contacts</h1>
            </div>
          </header>
          <p className="card__subtitle">
            Search by phone number to start a chat or send a new request.
          </p>
          <ContactSearch currentUser={currentUser} onSendRequest={handleSendRequest} />
        </section>
        <section className="card card--wide">
          <header className="card__header">
            <div>
              <p className="eyebrow">Chafo</p>
              <h1>Incoming contact requests</h1>
            </div>
            <span className="badge">{pendingCount} pending</span>
          </header>
          <p className="card__subtitle">
            Review requests from guardians and classmates before you start chatting.
          </p>
          <div className="request-list">
            {incomingRequests.map((request) => (
              <article key={request.id} className="request-card">
                <div className="request-card__header">
                  <div>
                    <h2>{request.name}</h2>
                    <p className="request-card__meta">{request.sentAt}</p>
                  </div>
                  <div className="request-card__contact">
                    <span>{request.phone}</span>
                    <span>{request.email}</span>
                  </div>
                </div>
                <div className="request-card__status-row">
                  <span
                    className={`status-pill status-pill--${request.status}`}
                  >
                    {statusLabels[request.status]}
                  </span>
                </div>
                <p className="request-card__note">{request.note}</p>
                <div className="request-card__actions">
                  {request.status === 'pending' ? (
                    <>
                      <button
                        className="button button--primary"
                        type="button"
                        onClick={() => handleRequestAction(request.id, 'accepted')}
                      >
                        Accept
                      </button>
                      <button
                        className="button button--ghost"
                        type="button"
                        onClick={() => handleRequestAction(request.id, 'rejected')}
                      >
                        Decline
                      </button>
                    </>
                  ) : (
                    <span className="request-card__status-text">
                      Request {request.status}.
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="card card--wide">
          <header className="card__header">
            <div>
              <p className="eyebrow">Messages</p>
              <h1>Recent chats</h1>
            </div>
            <span className="badge">{initialMessages.length}</span>
          </header>
          <p className="card__subtitle">
            Messages disappear 30 seconds after they are read.
          </p>
          <MessageList initialMessages={initialMessages} />
        </section>
      </main>
    </>
  );
}
