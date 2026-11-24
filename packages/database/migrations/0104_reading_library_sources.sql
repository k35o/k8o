INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('React Aria', 'https://react-spectrum.adobe.com/releases.xml', 'feed', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('shadcn/ui', 'https://ui.shadcn.com/rss.xml', 'feed', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Bun', 'https://bun.com/rss.xml', 'feed', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Svelte', 'https://svelte.dev/blog/rss.xml', 'feed', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Solid', 'https://www.solidjs.com/rss.xml', 'feed', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('MCP', 'https://blog.modelcontextprotocol.io/index.xml', 'feed', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('GitHub Actions', 'https://github.blog/changelog/label/actions/feed/', 'feed', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('React', 'https://github.com/facebook/react/releases.atom', 'github-releases', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Next.js', 'https://github.com/vercel/next.js/releases.atom', 'github-releases', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Vite', 'https://github.com/vitejs/vite/releases.atom', 'github-releases', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Vitest', 'https://github.com/vitest-dev/vitest/releases.atom', 'github-releases', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('pnpm', 'https://github.com/pnpm/pnpm/releases.atom', 'github-releases', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('MSW', 'https://github.com/mswjs/msw/releases.atom', 'github-releases', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Zod', 'https://github.com/colinhacks/zod/releases.atom', 'github-releases', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Hono', 'https://github.com/honojs/hono/releases.atom', 'github-releases', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Vite+', 'https://github.com/voidzero-dev/vite-plus/releases.atom', 'github-releases', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('oxlint', 'https://github.com/oxc-project/oxc/releases.atom#oxlint_v', 'github-releases', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Playwright', 'https://github.com/microsoft/playwright/releases.atom', 'github-releases', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('json-render', 'https://github.com/vercel-labs/json-render/releases.atom', 'github-releases', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Tailwind CSS', 'https://github.com/tailwindlabs/tailwindcss/releases.atom', 'github-releases', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Deno', 'https://github.com/denoland/deno/releases.atom', 'github-releases', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Storybook', 'https://github.com/storybookjs/storybook/releases.atom', 'github-releases', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Vue', 'https://github.com/vuejs/core/releases.atom', 'github-releases', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Base UI', 'https://github.com/mui/base-ui/releases.atom', 'github-releases', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('web-features', 'https://github.com/web-platform-dx/web-features/releases.atom', 'github-releases', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;
