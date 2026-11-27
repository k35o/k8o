-- タグ: id は書かない。既存なら何もしない
INSERT INTO tags (name) VALUES ('CSS Typed OM') ON CONFLICT (name) DO NOTHING;--> statement-breakpoint
INSERT INTO tags (name) VALUES ('Numeric factory functions') ON CONFLICT (name) DO NOTHING;--> statement-breakpoint

-- ブログ: slug が一意なので id は書かない
INSERT INTO blogs (slug, published, created_at)
VALUES ('css-typed-om', 1, '2026-11-27T00:00:00.000Z') ON CONFLICT (slug) DO NOTHING;--> statement-breakpoint

-- ビューカウント初期化（ブログは slug で引く）
INSERT INTO blog_views (blog_id, views)
VALUES ((SELECT id FROM blogs WHERE slug = 'css-typed-om'), 0)
ON CONFLICT (blog_id) DO NOTHING;--> statement-breakpoint

-- タグ紐付け (CSS, JavaScript, Baseline 2026, CSS Typed OM, Numeric factory functions)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'css-typed-om'),
  (SELECT id FROM tags WHERE name = 'CSS')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'css-typed-om'),
  (SELECT id FROM tags WHERE name = 'JavaScript')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'css-typed-om'),
  (SELECT id FROM tags WHERE name = 'Baseline 2026')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'css-typed-om'),
  (SELECT id FROM tags WHERE name = 'CSS Typed OM')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'css-typed-om'),
  (SELECT id FROM tags WHERE name = 'Numeric factory functions')
) ON CONFLICT DO NOTHING;
