-- 新しいタグの追加（既存なら何もしない）
INSERT INTO tags (name) VALUES ('WebGL') ON CONFLICT (name) DO NOTHING;--> statement-breakpoint
INSERT INTO tags (name) VALUES ('EXT_texture_norm16') ON CONFLICT (name) DO NOTHING;--> statement-breakpoint

-- ブログレコードの追加（slug が一意なので id は書かない）
INSERT INTO blogs (slug, published, created_at)
VALUES ('ext-texture-norm16', 1, '2026-11-08T00:00:00.000Z') ON CONFLICT (slug) DO NOTHING;--> statement-breakpoint

-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views)
VALUES ((SELECT id FROM blogs WHERE slug = 'ext-texture-norm16'), 0)
ON CONFLICT (blog_id) DO NOTHING;--> statement-breakpoint

-- タグ紐付け (JavaScript, Baseline 2026, WebGL, EXT_texture_norm16)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'ext-texture-norm16'),
  (SELECT id FROM tags WHERE name = 'JavaScript')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'ext-texture-norm16'),
  (SELECT id FROM tags WHERE name = 'Baseline 2026')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'ext-texture-norm16'),
  (SELECT id FROM tags WHERE name = 'WebGL')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'ext-texture-norm16'),
  (SELECT id FROM tags WHERE name = 'EXT_texture_norm16')
) ON CONFLICT DO NOTHING;
