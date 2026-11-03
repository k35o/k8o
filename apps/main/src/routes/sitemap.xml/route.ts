import { generateSitemap } from '@/shared/site/sitemap';

export async function GET(): Promise<Response> {
  return new Response(await generateSitemap(), {
    headers: { 'Content-Type': 'application/xml' },
  });
}
