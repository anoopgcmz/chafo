import { MessageList } from './components/MessageList';

const incomingRequests = [
  {
    id: 'req-902',
    name: 'Ava Carter',
    phone: '+1 (415) 555-0123',
    email: 'ava.carter@example.com',
    note: 'Hi! I met you at the robotics camp and would love to stay in touch.',
    sentAt: '2 hours ago',
  },
  {
    id: 'req-903',
    name: 'Mateo Silva',
    phone: '+1 (312) 555-0198',
    email: 'mateo.silva@example.com',
    note: 'Can we connect for the upcoming science fair project?',
    sentAt: 'Yesterday',
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

export default function HomePage() {
  return (
    <main className="page">
      <section className="card card--wide">
        <header className="card__header">
          <div>
            <p className="eyebrow">Chafo</p>
            <h1>Incoming contact requests</h1>
          </div>
          <span className="badge">{incomingRequests.length} new</span>
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
              <p className="request-card__note">{request.note}</p>
              <div className="request-card__actions">
                <button className="button button--primary" type="button">
                  Accept
                </button>
                <button className="button button--ghost" type="button">
                  Decline
                </button>
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
  );
}
