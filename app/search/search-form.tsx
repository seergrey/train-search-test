'use client';

import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { DEFAULT_SEARCH_QUERY, searchHref } from '@/lib/search-params';
import type { SearchQuery, SortOrder, Station } from '@/lib/types';

interface SearchFormProps {
  stations: Station[];
  /** Human message when /stations failed — form still works via free-text city fields. */
  stationsError: string | null;
  initialQuery: SearchQuery;
}

/**
 * Owns a local draft of the search state and only touches the URL on
 * submit, via router.push — it never fetches trains itself. app/search/page.tsx
 * (a Server Component) reacts to the new searchParams and refetches.
 */
export function SearchForm({ stations, stationsError, initialQuery }: SearchFormProps) {
  const router = useRouter();
  const formId = useId();

  const [from, setFrom] = useState(initialQuery.from);
  const [to, setTo] = useState(initialQuery.to);
  const [date, setDate] = useState(initialQuery.date);
  const [maxPrice, setMaxPrice] = useState(
    initialQuery.maxPrice === null ? '' : String(initialQuery.maxPrice),
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialQuery.sortOrder);

  const sameCity = from !== '' && to !== '' && from === to;
  const isFiltered =
    from !== DEFAULT_SEARCH_QUERY.from ||
    to !== DEFAULT_SEARCH_QUERY.to ||
    date !== DEFAULT_SEARCH_QUERY.date ||
    maxPrice !== '' ||
    sortOrder !== DEFAULT_SEARCH_QUERY.sortOrder;

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (sameCity) return;

    const trimmedPrice = maxPrice.trim();
    const query: SearchQuery = {
      from,
      to,
      date,
      maxPrice: trimmedPrice === '' ? null : Number(trimmedPrice),
      sortBy: 'price',
      sortOrder,
    };
    router.push(searchHref(query));
  }

  function handleSwap(): void {
    setFrom(to);
    setTo(from);
  }

  function handleClear(): void {
    setFrom(DEFAULT_SEARCH_QUERY.from);
    setTo(DEFAULT_SEARCH_QUERY.to);
    setDate(DEFAULT_SEARCH_QUERY.date);
    setMaxPrice('');
    setSortOrder(DEFAULT_SEARCH_QUERY.sortOrder);
    router.push(searchHref(DEFAULT_SEARCH_QUERY));
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 p-4">
      {stationsError !== null ? (
        <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Couldn&apos;t load the city list ({stationsError}). Type a city name below instead.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:items-end">
        <Field label="From" htmlFor={`${formId}-from`}>
          <CityInput
            id={`${formId}-from`}
            stations={stations}
            useFallback={stationsError !== null}
            value={from}
            onChange={setFrom}
            placeholder="Any city"
          />
        </Field>

        <div className="relative">
          <Field label="To" htmlFor={`${formId}-to`}>
            <CityInput
              id={`${formId}-to`}
              stations={stations}
              useFallback={stationsError !== null}
              value={to}
              onChange={setTo}
              placeholder="Any city"
            />
          </Field>
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap cities"
            title="Swap cities"
            className="absolute -top-3 -right-1 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-xs text-slate-500 hover:bg-slate-50 sm:flex"
          >
            ⇄
          </button>
        </div>

        <Field label="Date" htmlFor={`${formId}-date`}>
          <input
            id={`${formId}-date`}
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-10 w-full rounded-md border border-slate-300 px-2 text-sm"
          />
        </Field>

        <Field label="Max price" htmlFor={`${formId}-max-price`}>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-sm text-slate-400">
              €
            </span>
            <input
              id={`${formId}-max-price`}
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="No limit"
              className="h-10 w-full rounded-md border border-slate-300 pr-2 pl-6 text-sm"
            />
          </div>
        </Field>

        <Field label="Sort by price" htmlFor={`${formId}-sort`}>
          <select
            id={`${formId}-sort`}
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-2 text-sm"
          >
            <option value="asc">Low to high</option>
            <option value="desc">High to low</option>
          </select>
        </Field>
      </div>

      {sameCity ? (
        <p className="mt-3 text-xs text-red-600">Departure and arrival cities must differ.</p>
      ) : null}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={sameCity}
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Search trains
        </button>
        {isFiltered ? (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
          >
            Clear filters
          </button>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-xs font-medium text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function CityInput({
  id,
  stations,
  useFallback,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  stations: Station[];
  useFallback: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  if (useFallback) {
    return (
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value.trim().toLowerCase())}
        placeholder="e.g. berlin"
        className="h-10 w-full rounded-md border border-slate-300 px-2 text-sm"
      />
    );
  }

  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-md border border-slate-300 bg-white px-2 text-sm"
    >
      <option value="">{placeholder}</option>
      {stations.map((station) => (
        <option key={station.slug} value={station.slug}>
          {station.name}
        </option>
      ))}
    </select>
  );
}
