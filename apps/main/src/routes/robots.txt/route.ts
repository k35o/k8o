const content = `User-Agent: *
Allow: /
Disallow: /api/

Sitemap: https://k8o.me/sitemap.xml
`;

export function GET(): Response {
  return new Response(content, { headers: { 'Content-Type': 'text/plain' } });
}
