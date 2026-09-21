import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import Container from '../../components/common/Container.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ConnectedProductCard from '../../components/product/ConnectedProductCard.jsx';
import SearchBar from '../../components/common/SearchBar.jsx';
import { useProducts } from '../../hooks/useProducts.js';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = (searchParams.get('q') || '').trim();

  const [input, setInput] = useState(urlQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(urlQuery);
  const debounceTimerRef = useRef(null);

  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);

  // Sync state if URL changes externally
  if (prevUrlQuery !== urlQuery) {
    setPrevUrlQuery(urlQuery);
    setInput(urlQuery);
    setDebouncedQuery(urlQuery);
  }

  // 300ms Debounce effect
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const trimmed = input.trim();
      setDebouncedQuery(trimmed);

      // Gracefully handle empty states without invalid API calls or throwing errors
      if (trimmed) {
        setSearchParams({ q: trimmed }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [input, setSearchParams]);

  // Only enable product query if query is non-empty, preventing 400 validation errors
  const isQueryActive = debouncedQuery.length > 0;

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useProducts(
    { search: debouncedQuery, limit: 24 },
    { enabled: isQueryActive }
  );

  const results = data?.items ?? [];

  const handleImmediateSearch = (value) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const next = (value ?? input).trim();
    setInput(next);
    setDebouncedQuery(next);
    setSearchParams(next ? { q: next } : {}, { replace: true });
  };

  const handleClear = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setInput('');
    setDebouncedQuery('');
    setSearchParams({}, { replace: true });
  };

  return (
    <section className="section py-8 lg:py-12">
      <Container>
        <div className="max-w-2xl mb-8">
          <p className="eyebrow text-brand-600">Product Finder</p>
          <h1 className="headline mt-1 text-2xl text-text-primary sm:text-3xl font-bold">
            Search Groceries & Essentials
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Find fresh fruits, vegetables, dairy, snacks, and staples in real-time.
          </p>

          <div className="mt-5">
            <SearchBar
              value={input}
              onChange={setInput}
              onSubmit={handleImmediateSearch}
              onClear={handleClear}
              placeholder="Search by name, brand (Amul, Tata) or item..."
            />
          </div>
        </div>

        {isQueryActive ? (
          <>
            {isLoading ? (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 10 }, (_, index) => (
                  <div
                    key={index}
                    className="skeleton h-64 w-full rounded-2xl"
                    aria-hidden="true"
                  />
                ))}
              </div>
            ) : isError ? (
              <EmptyState
                preset="generic"
                title="Search failed"
                description="We could not fetch search results right now. Please try again."
                action="Retry"
                onAction={refetch}
              />
            ) : (
              <>
                <div className="flex items-center justify-between mt-4 mb-6">
                  <p className="text-sm text-text-secondary">
                    Showing <span className="font-bold text-text-primary">{results.length}</span> result{results.length === 1 ? '' : 's'} for{' '}
                    <span className="font-semibold text-brand-700">
                      &ldquo;{debouncedQuery}&rdquo;
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    Clear Search
                  </button>
                </div>

                {results.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                    {results.map((product) => (
                      <ConnectedProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    preset="search"
                    title={`No results for "${debouncedQuery}"`}
                    description="Check your spelling or try searching with general terms like milk, tea, rice or butter."
                    action="Clear Search"
                    onAction={handleClear}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-border-light bg-surface/50 p-8 sm:p-12 text-center max-w-xl mx-auto">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-text-primary">
              Ready to Search
            </h3>
            <p className="mt-1 text-sm text-text-muted">
              Type any product name or brand above for instant real-time results.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {['Milk', 'Butter', 'Atta', 'Rice', 'Tea', 'Apple'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleImmediateSearch(tag)}
                  className="rounded-xl border border-border bg-surface px-3 py-1 text-xs font-semibold text-text-secondary hover:border-brand-400 hover:text-brand-700 transition-colors shadow-xs"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
