import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('joins class names with a single space', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('drops falsy entries from conditional variants', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('drops empty strings so no double space appears', () => {
    expect(cn('a', '', 'b')).toBe('a b');
  });

  it('returns an empty string when nothing applies', () => {
    expect(cn(false, undefined)).toBe('');
  });
});
