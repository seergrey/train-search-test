import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Pagination, pageItems } from './pagination';

function hrefForPage(page: number): string {
  return `/search?page=${page}`;
}

describe('pageItems', () => {
  it('lists every page when they all fit', () => {
    expect(pageItems(1, 3)).toEqual([1, 2, 3]);
  });

  it('collapses the far side into a gap', () => {
    expect(pageItems(1, 15)).toEqual([1, 2, 'gap', 15]);
  });

  it('keeps first and last visible around a middle page', () => {
    expect(pageItems(8, 15)).toEqual([1, 'gap', 7, 8, 9, 'gap', 15]);
  });

  it('does not insert a gap for a single skipped page', () => {
    expect(pageItems(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('handles a single page', () => {
    expect(pageItems(1, 1)).toEqual([1]);
  });
});

describe('Pagination', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(
      <Pagination page={1} pageCount={1} hasPrevious={false} hasNext={false} hrefForPage={hrefForPage} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('marks the current page for assistive tech', () => {
    render(<Pagination page={2} pageCount={5} hasPrevious hasNext hrefForPage={hrefForPage} />);
    expect(screen.getByRole('link', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Page 3' })).not.toHaveAttribute('aria-current');
  });

  it('links each page to its own URL, so results stay shareable', () => {
    render(<Pagination page={2} pageCount={5} hasPrevious hasNext hrefForPage={hrefForPage} />);
    expect(screen.getByRole('link', { name: 'Page 3' })).toHaveAttribute('href', '/search?page=3');
  });

  // At the edges the control must not look like a working link.
  it('disables Previous on the first page', () => {
    render(<Pagination page={1} pageCount={5} hasPrevious={false} hasNext hrefForPage={hrefForPage} />);
    expect(screen.queryByRole('link', { name: /previous/i })).toBeNull();
    expect(screen.getByText(/previous/i)).toHaveAttribute('aria-disabled', 'true');
  });

  it('disables Next on the last page', () => {
    render(<Pagination page={5} pageCount={5} hasPrevious hasNext={false} hrefForPage={hrefForPage} />);
    expect(screen.queryByRole('link', { name: /next/i })).toBeNull();
    expect(screen.getByText(/next/i)).toHaveAttribute('aria-disabled', 'true');
  });

  it('points Previous and Next at the adjacent pages', () => {
    render(<Pagination page={3} pageCount={5} hasPrevious hasNext hrefForPage={hrefForPage} />);
    expect(screen.getByRole('link', { name: /previous/i })).toHaveAttribute('href', '/search?page=2');
    expect(screen.getByRole('link', { name: /next/i })).toHaveAttribute('href', '/search?page=4');
  });

  it('exposes the pager as a labelled navigation landmark', () => {
    render(<Pagination page={1} pageCount={5} hasPrevious={false} hasNext hrefForPage={hrefForPage} />);
    expect(screen.getByRole('navigation', { name: 'Results pages' })).toBeInTheDocument();
  });
});
