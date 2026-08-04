-- 新しいタグの追加（既存なら何もしない）
INSERT INTO tags (name) VALUES ('Intl.Locale') ON CONFLICT (name) DO NOTHING;--> statement-breakpoint

-- ブログレコードの追加（slug が一意なので id は書かない）
INSERT INTO blogs (slug, published, created_at)
VALUES ('intl-locale-info', 1, '2026-08-04T00:00:00.000Z') ON CONFLICT (slug) DO NOTHING;--> statement-breakpoint

-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views)
VALUES ((SELECT id FROM blogs WHERE slug = 'intl-locale-info'), 0)
ON CONFLICT (blog_id) DO NOTHING;--> statement-breakpoint

-- タグ紐付け (JavaScript, Baseline 2026, Intl, Intl.Locale)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'intl-locale-info'),
  (SELECT id FROM tags WHERE name = 'JavaScript')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'intl-locale-info'),
  (SELECT id FROM tags WHERE name = 'Baseline 2026')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'intl-locale-info'),
  (SELECT id FROM tags WHERE name = 'Intl')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'intl-locale-info'),
  (SELECT id FROM tags WHERE name = 'Intl.Locale')
) ON CONFLICT DO NOTHING;
