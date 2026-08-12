'use client';

import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';
import { Alert, Button, Card, Field, Select, TextInput } from '@/components/ui';
import { DEFAULT_SEARCH_QUERY, searchHref, withFilters } from '@/lib/search-params';
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
    // withFilters resets `page`: a new filter set makes the old page number meaningless.
    const query = withFilters(initialQuery, {
      from,
      to,
      date,
      maxPrice: trimmedPrice === '' ? null : Number(trimmedPrice),
      sortBy: 'price',
      sortOrder,
    });
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

  const cityErrorId = `${formId}-city-error`;

  return (
    <Card padded={false}>
      <form onSubmit={handleSubmit} role="search" aria-label="Train search" className="p-4">
        {stationsError !== null ? (
          <Alert tone="warning" role="status" className="mb-3 space-y-0 p-3 text-xs">
            Couldn&apos;t load the city list ({stationsError}). Type a city name below instead.
          </Alert>
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
              invalid={sameCity}
              describedBy={sameCity ? cityErrorId : undefined}
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
                invalid={sameCity}
                describedBy={sameCity ? cityErrorId : undefined}
              />
            </Field>
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap departure and arrival cities"
              title="Swap cities"
              className="absolute -top-3 -right-1 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-xs text-content-muted hover:bg-surface-muted sm:flex"
            >
              <span aria-hidden="true">⇄</span>
            </button>
          </div>

          <Field label="Date" htmlFor={`${formId}-date`}>
            <TextInput
              id={`${formId}-date`}
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </Field>

          <Field label="Max price" htmlFor={`${formId}-max-price`}>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-sm text-content-subtle">
                €
              </span>
              <TextInput
                id={`${formId}-max-price`}
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="No limit"
                className="pr-2 pl-6"
              />
            </div>
          </Field>

          <Field label="Sort by price" htmlFor={`${formId}-sort`}>
            <Select
              id={`${formId}-sort`}
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            >
              <option value="asc">Low to high</option>
              <option value="desc">High to low</option>
            </Select>
          </Field>
        </div>

        {sameCity ? (
          <p id={cityErrorId} role="alert" aria-live="polite" className="mt-3 text-xs text-danger-content">
            Departure and arrival cities must differ.
          </p>
        ) : null}

        <div className="mt-4 flex items-center gap-3">
          <Button type="submit" disabled={sameCity}>
            Search trains
          </Button>
          {isFiltered ? (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear filters
            </Button>
          ) : null}
        </div>
      </form>
    </Card>
  );
}

function CityInput({
  id,
  stations,
  useFallback,
  value,
  onChange,
  placeholder,
  invalid,
  describedBy,
}: {
  id: string;
  stations: Station[];
  useFallback: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  invalid?: boolean;
  describedBy?: string;
}) {
  if (useFallback) {
    return (
      <TextInput
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value.trim().toLowerCase())}
        placeholder="e.g. berlin"
        aria-invalid={invalid ?? undefined}
        aria-describedby={describedBy}
      />
    );
  }

  return (
    <Select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-invalid={invalid ?? undefined}
      aria-describedby={describedBy}
    >
      <option value="">{placeholder}</option>
      {stations.map((station) => (
        <option key={station.slug} value={station.slug}>
          {station.name}
        </option>
      ))}
    </Select>
  );
}
