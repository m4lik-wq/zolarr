import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/components/sss/sss-client', () => ({
  SssClient: () => <div data-testid="sss-client" />,
}));
vi.mock('@/lib/db/queries/faqs', () => ({
  listFaqs: vi.fn().mockResolvedValue([]),
}));

import SssPage from '@/app/sss/page';

describe('SssPage', () => {
  it('renders heading and client', async () => {
    const ui = await SssPage();
    render(ui);
    expect(screen.getByText(/Sıkça Sorulan Sorular/i)).toBeInTheDocument();
    expect(screen.getByTestId('sss-client')).toBeInTheDocument();
  });
});
