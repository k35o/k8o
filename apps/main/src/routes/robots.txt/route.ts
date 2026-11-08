import { SITE_URL } from '@/shared/site/site-url';

const content = `User-Agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

export function GET(): Response {
  return new Response(content, { headers: { 'Content-Type': 'text/plain' } });
}
