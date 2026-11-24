UPDATE article_sources
  SET title = 'Chrome for Developers', url = 'https://developer.chrome.com/_d/dynamic_content?hl=en', type = 'devsite-blog', updated_at = '2026-11-24T00:00:00.000Z'
  WHERE title = 'chrome for developers' AND type = 'feed';--> statement-breakpoint
UPDATE article_sources
  SET url = 'https://web.dev/_d/dynamic_content?hl=en', type = 'devsite-blog', updated_at = '2026-11-24T00:00:00.000Z'
  WHERE title = 'web.dev' AND type = 'feed';--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('Chrome for Developers', 'https://developer.chrome.com/_d/dynamic_content?hl=en', 'devsite-blog', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, type, created_at, updated_at)
  VALUES ('web.dev', 'https://web.dev/_d/dynamic_content?hl=en', 'devsite-blog', '2026-11-24T00:00:00.000Z', '2026-11-24T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;
