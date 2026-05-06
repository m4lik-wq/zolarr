import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChatMessage } from '@/components/ai/chat-message';

describe('ChatMessage', () => {
  it('renders user content as plain text', () => {
    render(<ChatMessage role="user" content="Merhaba" />);
    expect(screen.getByText('Merhaba')).toBeInTheDocument();
  });

  it('renders assistant markdown bold', () => {
    render(<ChatMessage role="assistant" content="Bu **kalın** metin" />);
    expect(screen.getByText('kalın').tagName.toLowerCase()).toBe('strong');
  });

  it('shows TTS button only for assistant messages', () => {
    const { rerender } = render(<ChatMessage role="user" content="x" />);
    expect(screen.queryByLabelText(/Sesli oku/i)).not.toBeInTheDocument();
    rerender(<ChatMessage role="assistant" content="x" />);
    expect(screen.getByLabelText(/Sesli oku/i)).toBeInTheDocument();
  });
});
