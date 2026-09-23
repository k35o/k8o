-- 新しいタグの追加（既存なら何もしない）
INSERT INTO tags (name) VALUES ('alpha()') ON CONFLICT (name) DO NOTHING;--> statement-breakpoint

-- ブログレコードの追加（slug が一意なので id は書かない）
INSERT INTO blogs (slug, published, created_at)
VALUES ('alpha-function', 1, '2026-09-23T00:00:00.000Z') ON CONFLICT (slug) DO NOTHING;--> statement-breakpoint

-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views)
VALUES ((SELECT id FROM blogs WHERE slug = 'alpha-function'), 0)
ON CONFLICT (blog_id) DO NOTHING;--> statement-breakpoint

-- タグ紐付け (CSS, Baseline 2026, alpha())
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'alpha-function'),
  (SELECT id FROM tags WHERE name = 'CSS')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'alpha-function'),
  (SELECT id FROM tags WHERE name = 'Baseline 2026')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'alpha-function'),
  (SELECT id FROM tags WHERE name = 'alpha()')
) ON CONFLICT DO NOTHING;
