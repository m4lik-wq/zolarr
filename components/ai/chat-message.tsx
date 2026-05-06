'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TtsControls } from './tts-controls';
import { cn } from '@/lib/utils';

interface Props {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatMessage({ role, content }: Props) {
  const isUser = role === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2 text-sm',
          isUser
            ? 'bg-[var(--color-brand)] text-[var(--color-bg-base)]'
            : 'bg-[var(--color-bg-overlay)] text-[var(--color-text-primary)]'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        ) : (
          <div className="prose prose-sm max-w-none break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            {content.length > 0 && <TtsControls text={content} />}
          </div>
        )}
      </div>
    </div>
  );
}
