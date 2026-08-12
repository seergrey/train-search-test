/**
 * Joins class names, dropping falsy entries. Deliberately not `clsx` +
 * `tailwind-merge`: the UI primitives own their base classes and expose
 * variants, so callers never need to override a token-driven class.
 */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter((value): value is string => typeof value === 'string' && value !== '').join(' ');
}
