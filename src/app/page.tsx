import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page">
      <section className="card">
        <h1>Chafo</h1>
        <p>
          Baseline Next.js App Router setup with TypeScript, linting, formatting, and
          MongoDB utilities.
        </p>
        <Link href="/api/health">Health check</Link>
      </section>
    </main>
  );
}
