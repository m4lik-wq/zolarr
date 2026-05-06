import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ApplianceList } from '@/components/teklif/appliance-list';

const apps = [
  { name: 'Buzdolabı', consumptionKwh: 50, powerW: 200 },
  { name: 'Çamaşır Makinesi', consumptionKwh: 30 },
];

describe('ApplianceList', () => {
  it('shows each appliance', () => {
    render(<ApplianceList appliances={apps} onRemove={vi.fn()} />);
    expect(screen.getByText('Buzdolabı')).toBeInTheDocument();
    expect(screen.getByText('Çamaşır Makinesi')).toBeInTheDocument();
  });

  it('calls onRemove with index', async () => {
    const handler = vi.fn();
    const user = userEvent.setup();
    render(<ApplianceList appliances={apps} onRemove={handler} />);
    const removeButtons = screen.getAllByRole('button', { name: /Sil/i });
    await user.click(removeButtons[0]!);
    expect(handler).toHaveBeenCalledWith(0);
  });
});
