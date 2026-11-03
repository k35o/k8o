import { OgImage } from '@/components/site/og-image/og-image';

export async function GET(): Promise<Response> {
  return OgImage({ title: 'k8o' });
}
