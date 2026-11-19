-- スライドはまだ無いので、slug と deck_published_at は入れない。talks の id はマイグレーションの外でも採番されるので、イベントの URL で引く
INSERT INTO talks (title, event_url, event_name, event_date, event_location)
  SELECT 'Panda CSSにみる、ライブラリを直接importしないCSS in JSだからできること', 'https://jsconf.jp/2026/ja/talks/dwango-sponsor-session', 'JSConf JP 2026', '2026-11-22', 'ベルサール神田'
  WHERE NOT EXISTS (SELECT 1 FROM talks WHERE event_url = 'https://jsconf.jp/2026/ja/talks/dwango-sponsor-session');--> statement-breakpoint
INSERT INTO tags (name) VALUES ('CSS in JS') ON CONFLICT (name) DO NOTHING;--> statement-breakpoint
INSERT INTO tags (name) VALUES ('Panda CSS') ON CONFLICT (name) DO NOTHING;--> statement-breakpoint
INSERT INTO talk_tag (talk_id, tag_id)
  SELECT talks.id, tags.id FROM talks, tags
  WHERE talks.event_url = 'https://jsconf.jp/2026/ja/talks/dwango-sponsor-session'
    AND tags.name IN ('JavaScript', 'CSS in JS', 'Panda CSS', 'TypeScript')
  ON CONFLICT DO NOTHING;
