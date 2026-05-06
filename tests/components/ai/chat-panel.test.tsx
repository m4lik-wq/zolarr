import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ChatPanel } from '@/components/ai/chat-panel';
import { useChatStore } from '@/lib/store/chat';

describe('ChatPanel', () => {
  beforeEach(() =>
    useChatStore.setState({
      isOpen: true,
      messages: [],
      errorMessage: null,
      isStreaming: false,
    })
  );

  it('renders header and empty-state hint when no messages', () => {
    render(<ChatPanel />);
    expect(screen.getByText(/Zolarr AI Asistan/i)).toBeInTheDocument();
    expect(screen.getByText(/Merhaba/i)).toBeInTheDocument();
  });

  it('returns null when not open', () => {
    useChatStore.setState({ isOpen: false });
    const { container } = render(<ChatPanel />);
    expect(container.firstChild).toBeNull();
  });
});
