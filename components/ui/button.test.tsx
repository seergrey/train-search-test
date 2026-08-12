import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button, LinkButton, buttonClasses } from './button';

/**
 * The regression these tests exist for: primary actions were once styled
 * ad hoc per route, and the search page ended up with a different "primary"
 * colour from the train page. Every primary now resolves to one token.
 */

describe('buttonClasses', () => {
  it('resolves primary to the brand token, not a raw palette class', () => {
    const classes = buttonClasses('primary');
    expect(classes).toContain('bg-primary');
    expect(classes).not.toMatch(/bg-(slate|blue|gray|indigo)-\d{3}/);
  });

  it('gives the same classes wherever primary is used', () => {
    expect(buttonClasses('primary', 'md')).toBe(buttonClasses('primary', 'md'));
  });

  it('varies by size without changing the variant colour', () => {
    expect(buttonClasses('primary', 'sm')).toContain('bg-primary');
    expect(buttonClasses('primary', 'full')).toContain('w-full');
  });

  it('never emits a hard-coded hex or arbitrary colour value', () => {
    for (const variant of ['primary', 'secondary', 'ghost', 'danger', 'warning', 'success'] as const) {
      expect(buttonClasses(variant)).not.toMatch(/#[0-9a-f]{3,6}|\[.*(rgb|oklch|#).*\]/i);
    }
  });
});

describe('Button', () => {
  it('defaults to type="button", so it cannot submit a form by accident', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button');
  });

  it('honours an explicit submit type', () => {
    render(<Button type="submit">Search trains</Button>);
    expect(screen.getByRole('button', { name: 'Search trains' })).toHaveAttribute('type', 'submit');
  });

  it('forwards disabled state', () => {
    render(<Button disabled>Book now</Button>);
    expect(screen.getByRole('button', { name: 'Book now' })).toBeDisabled();
  });

  it('forwards arbitrary props such as aria-pressed', () => {
    render(<Button aria-pressed>Save train</Button>);
    expect(screen.getByRole('button', { name: 'Save train' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('LinkButton', () => {
  it('renders a real link that looks like a button', () => {
    render(<LinkButton href="/search">Back to results</LinkButton>);
    const link = screen.getByRole('link', { name: 'Back to results' });
    expect(link).toHaveAttribute('href', '/search');
    expect(link.className).toBe(buttonClasses('primary', 'md'));
  });

  it('shares its variant styling with Button', () => {
    render(<LinkButton href="/search" variant="secondary" size="sm">Back</LinkButton>);
    expect(screen.getByRole('link', { name: 'Back' }).className).toBe(buttonClasses('secondary', 'sm'));
  });
});
