import { generateLlmsContent } from '@/shared/site/llms-content';

export async function GET(): Promise<Response> {
  return new Response(await generateLlmsContent(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
