import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAnthropic, AI_MODEL, AI_MAX_TOKENS } from '@/lib/ai/client';
import { ZOLARR_SYSTEM_PROMPT } from '@/lib/ai/system-prompt';
import { checkAndIncrement, checkAndIncrementForUser, extractIp } from '@/lib/ai/rate-limit';
import { getCurrentUser } from '@/lib/auth/server';
import { retrieveContext } from '@/lib/ai/embeddings/retrieve';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(40),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Form geçersiz' }, { status: 400 });
  }

  const user = await getCurrentUser();
  let limit;
  try {
    limit = user
      ? await checkAndIncrementForUser(user.id)
      : await checkAndIncrement(extractIp(req));
  } catch (err) {
    console.error('[ai/chat] rate limit hata:', err);
    return NextResponse.json(
      { error: 'Sunucu hatası, lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Bugünkü mesaj hakkınız doldu (${limit.limit} mesaj/gün). Yarın tekrar deneyin veya /iletisim sayfasından bize ulaşın.`,
      },
      { status: 429 }
    );
  }

  const anthropic = getAnthropic();

  // Retrieve RAG context from the last user message and augment the system
  // prompt. retrieveContext returns [] when no provider/key is configured or
  // when the query is empty, keeping behavior identical to the pre-RAG path.
  const messagesArr = parsed.data.messages;
  const last = messagesArr.length > 0 ? messagesArr[messagesArr.length - 1] : null;
  const queryText = last && typeof last.content === 'string' ? last.content : '';
  let augmentedSystemPrompt = ZOLARR_SYSTEM_PROMPT;
  try {
    const context = await retrieveContext(queryText, 5);
    if (context.length > 0) {
      const sections = context
        .map((c) => `[${c.docType}] ${c.content}`)
        .join('\n\n---\n\n');
      augmentedSystemPrompt = `${ZOLARR_SYSTEM_PROMPT}

## Bilgi Tabanı (Kaynaklar)

Aşağıdaki kaynaklar şirket veritabanından geldi. Kullanıcının sorusunu cevaplarken bu bilgilerden yararlan, ama "kaynak X'te yazıyor ki" gibi açık referans verme. Doğal Türkçe ile cevapla.

${sections}`;
    }
  } catch (err) {
    console.error('[ai/chat] retrieveContext hata:', err);
    // Continue without context — never break streaming.
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        const response = anthropic.messages.stream({
          model: AI_MODEL,
          max_tokens: AI_MAX_TOKENS,
          system: [
            {
              type: 'text',
              text: augmentedSystemPrompt,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: messagesArr,
        });

        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(
              enc.encode(`data: ${JSON.stringify({ delta: event.delta.text })}\n\n`)
            );
          }
        }
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        controller.close();
      } catch (err) {
        console.error('[ai/chat] stream hata:', err);
        controller.enqueue(
          enc.encode(`data: ${JSON.stringify({ error: 'Stream hatası' })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-RateLimit-Limit': String(limit.limit),
      'X-RateLimit-Remaining': String(limit.remaining),
    },
  });
}
