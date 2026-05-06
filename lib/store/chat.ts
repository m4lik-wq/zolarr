'use client';

import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface State {
  isOpen: boolean;
  isStreaming: boolean;
  messages: ChatMessage[];
  errorMessage: string | null;
  open: () => void;
  close: () => void;
  toggle: () => void;
  appendUserMessage: (content: string) => void;
  startAssistantMessage: () => string;
  appendAssistantDelta: (id: string, delta: string) => void;
  finishAssistantMessage: () => void;
  setError: (message: string | null) => void;
  reset: () => void;
}

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useChatStore = create<State>((set) => ({
  isOpen: false,
  isStreaming: false,
  messages: [],
  errorMessage: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  appendUserMessage: (content) =>
    set((s) => ({
      messages: [...s.messages, { id: newId(), role: 'user', content }],
      errorMessage: null,
    })),
  startAssistantMessage: () => {
    const id = newId();
    set((s) => ({
      messages: [...s.messages, { id, role: 'assistant', content: '' }],
      isStreaming: true,
    }));
    return id;
  },
  appendAssistantDelta: (id, delta) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + delta } : m
      ),
    })),
  finishAssistantMessage: () => set({ isStreaming: false }),
  setError: (message) => set({ errorMessage: message, isStreaming: false }),
  reset: () => set({ messages: [], errorMessage: null, isStreaming: false }),
}));
