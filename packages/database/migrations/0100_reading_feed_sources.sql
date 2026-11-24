INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Claude', 'https://claude.com/blog/rss.xml', 'feed', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Simon Willison', 'https://simonwillison.net/atom/entries/', 'feed', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('LukeW', 'https://www.lukew.com/ff/rss.asp', 'feed', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Maggie Appleton', 'https://maggieappleton.com/rss.xml', 'feed', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('React', 'https://react.dev/rss.xml', 'feed', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('This Week In React', 'https://thisweekinreact.com/newsletter/rss.xml', 'feed', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('TanStack', 'https://tanstack.com/rss.xml', 'feed', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Bram.us', 'https://www.bram.us/feed/', 'feed', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;
