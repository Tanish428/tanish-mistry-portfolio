import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PublicLayout from './PublicLayout.jsx';

describe('PublicLayout Component (src/layouts/PublicLayout.jsx)', () => {
  it('1. Renders brand logo and navigation landmarks', () => {
    render(
      <MemoryRouter>
        <PublicLayout />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Tanish Mistry' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open navigation menu/i })).toBeInTheDocument();
  });

  it('2. Mobile hamburger toggles menu open and closed with aria-expanded update', async () => {
    render(
      <MemoryRouter>
        <PublicLayout />
      </MemoryRouter>
    );

    const toggleBtn = screen.getByRole('button', { name: /Open navigation menu/i });
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    // Click to open
    await userEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('navigation', { name: /Mobile Navigation/i })).toBeInTheDocument();

    // Click to close
    await userEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('navigation', { name: /Mobile Navigation/i })).toBeNull();
  });
});
