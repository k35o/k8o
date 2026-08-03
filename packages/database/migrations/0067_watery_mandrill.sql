-- 新しいタグの追加（既存なら何もしない）
INSERT INTO tags (name) VALUES ('JSON') ON CONFLICT (name) DO NOTHING;--> statement-breakpoint
INSERT INTO tags (name) VALUES ('JSON source text access') ON CONFLICT (name) DO NOTHING;--> statement-breakpoint

-- ブログレコードの追加（slug が一意なので id は書かない）
INSERT INTO blogs (slug, published, created_at)
VALUES ('json-raw', 1, '2026-07-30T00:00:00.000Z') ON CONFLICT (slug) DO NOTHING;--> statement-breakpoint

-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views)
VALUES ((SELECT id FROM blogs WHERE slug = 'json-raw'), 0)
ON CONFLICT (blog_id) DO NOTHING;--> statement-breakpoint

-- タグ紐付け (JavaScript, Baseline 2025, JSON, JSON source text access)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'json-raw'),
  (SELECT id FROM tags WHERE name = 'JavaScript')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'json-raw'),
  (SELECT id FROM tags WHERE name = 'Baseline 2025')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'json-raw'),
  (SELECT id FROM tags WHERE name = 'JSON')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'json-raw'),
  (SELECT id FROM tags WHERE name = 'JSON source text access')
) ON CONFLICT DO NOTHING;
