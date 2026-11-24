INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Claude Code', 'https://code.claude.com/docs/en/changelog/rss.xml', 'feed', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Claude Platform', 'https://platform.claude.com/docs/en/release-notes/feed.xml', 'feed', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;
