INSERT INTO article_sources (title, url, site_url, type, created_at, updated_at)
  VALUES ('Chrome', 'https://raw.githubusercontent.com/mdn/browser-compat-data/main/browsers/chrome.json', 'https://chromestatus.com/roadmap', 'browser-releases', '2026-11-21T00:00:00.000Z', '2026-11-21T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, site_url, type, created_at, updated_at)
  VALUES ('Firefox', 'https://raw.githubusercontent.com/mdn/browser-compat-data/main/browsers/firefox.json', 'https://developer.mozilla.org/docs/Mozilla/Firefox/Releases', 'browser-releases', '2026-11-21T00:00:00.000Z', '2026-11-21T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;--> statement-breakpoint
INSERT INTO article_sources (title, url, site_url, type, created_at, updated_at)
  VALUES ('Safari', 'https://raw.githubusercontent.com/mdn/browser-compat-data/main/browsers/safari.json', 'https://developer.apple.com/documentation/safari-release-notes', 'browser-releases', '2026-11-21T00:00:00.000Z', '2026-11-21T00:00:00.000Z')
  ON CONFLICT (url) DO NOTHING;
