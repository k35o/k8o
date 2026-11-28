-- タグ: id は書かない。既存なら何もしない
INSERT INTO tags (name) VALUES ('devicePixelRatio') ON CONFLICT (name) DO NOTHING;--> statement-breakpoint

-- ブログ: slug が一意なので id は書かない
INSERT INTO blogs (slug, published, created_at)
VALUES ('devicepixelratio', 1, '2026-11-28T00:00:00.000Z') ON CONFLICT (slug) DO NOTHING;--> statement-breakpoint

-- ビューカウント初期化（ブログは slug で引く）
INSERT INTO blog_views (blog_id, views)
VALUES ((SELECT id FROM blogs WHERE slug = 'devicepixelratio'), 0)
ON CONFLICT (blog_id) DO NOTHING;--> statement-breakpoint

-- タグ紐付け (JavaScript, Baseline 2026, devicePixelRatio)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'devicepixelratio'),
  (SELECT id FROM tags WHERE name = 'JavaScript')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'devicepixelratio'),
  (SELECT id FROM tags WHERE name = 'Baseline 2026')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'devicepixelratio'),
  (SELECT id FROM tags WHERE name = 'devicePixelRatio')
) ON CONFLICT DO NOTHING;
