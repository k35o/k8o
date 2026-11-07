import { SITE_OG_IMAGE_PNG } from '@/components/site/og-image/site-og-image';

export function GET(): Response {
  return new Response(SITE_OG_IMAGE_PNG, {
    headers: { 'Content-Type': 'image/png' },
  });
}
