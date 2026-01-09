'use client';

import { useEffect, useMemo, useState } from 'react';

import { normalizePhoneNumber, validatePhoneNumber } from '@/lib/phone';

type ContactSearchResult = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
};

type ContactSearchProps = {
  currentUser: {
    id: string;
    name: string;
    phone: string;
  };
};

export function ContactSearch({ currentUser }: ContactSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ContactSearchResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    'idle'
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const currentUserPhone = useMemo(
    () => normalizePhoneNumber(currentUser.phone),
    [currentUser.phone]
  );

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setValidationError(null);
      setStatus('idle');
      setHasSearched(false);
      return;
    }

    const validation = validatePhoneNumber(trimmed);
    if (validation.error || !validation.normalized) {
      setResults([]);
      setValidationError(validation.error ?? 'Phone number is invalid.');
      setStatus('idle');
      setHasSearched(false);
      return;
    }

    if (currentUserPhone && validation.normalized === currentUserPhone) {
      setResults([]);
      setValidationError('You cannot search for your own phone number.');
      setStatus('idle');
      setHasSearched(false);
      return;
    }

    setValidationError(null);

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setStatus('loading');
        const response = await fetch(
          `/api/contacts/search?phone=${encodeURIComponent(
            trimmed
          )}&requesterId=${encodeURIComponent(
            currentUser.id
          )}&requesterPhone=${encodeURIComponent(currentUser.phone)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          setResults([]);
          setStatus('error');
          setHasSearched(true);
          return;
        }

        const data = (await response.json()) as { results?: ContactSearchResult[] };
        setResults(data.results ?? []);
        setStatus('ready');
        setHasSearched(true);
      } catch (error) {
        if ((error as DOMException).name === 'AbortError') {
          return;
        }
        setResults([]);
        setStatus('error');
        setHasSearched(true);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [currentUser.id, currentUser.phone, currentUserPhone, query]);

  return (
    <div className="search">
      <label className="search__label" htmlFor="contact-search">
        Search accepted contacts by phone
      </label>
      <div className="search__field">
        <input
          id="contact-search"
          className="search__input"
          type="tel"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="+1 (415) 555-0184"
          autoComplete="tel"
        />
        {status === 'loading' ? (
          <span className="search__status">Searching…</span>
        ) : null}
      </div>
      <p className="search__helper">
        Use a full phone number with country code. We will only match accepted
        contacts.
      </p>
      {validationError ? (
        <p className="search__error">{validationError}</p>
      ) : null}
      {status === 'error' ? (
        <p className="search__error">
          Something went wrong while searching. Please try again.
        </p>
      ) : null}
      {status === 'ready' && results.length > 0 ? (
        <div className="search-results">
          {results.map((result) => (
            <article key={result.id} className="search-card">
              <div>
                <h2 className="search-card__title">{result.name}</h2>
                <p className="search-card__meta">{result.phone}</p>
                {result.email ? (
                  <p className="search-card__meta">{result.email}</p>
                ) : null}
              </div>
              <button className="button button--primary" type="button">
                Start chat
              </button>
            </article>
          ))}
        </div>
      ) : null}
      {status === 'ready' && results.length === 0 && hasSearched ? (
        <div className="search-empty">
          <p className="search-empty__text">
            No accepted contacts match that phone number yet.
          </p>
          <button className="button button--ghost" type="button">
            Send chat request
          </button>
        </div>
      ) : null}
    </div>
  );
}
