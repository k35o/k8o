-- 新しいタグの追加（既存なら何もしない）
INSERT INTO tags (name) VALUES ('Scoped custom element registries') ON CONFLICT (name) DO NOTHING;--> statement-breakpoint

-- ブログレコードの追加（slug が一意なので id は書かない）
INSERT INTO blogs (slug, published, created_at)
VALUES ('scoped-custom-element-registries', 1, '2026-11-07T00:00:00.000Z') ON CONFLICT (slug) DO NOTHING;--> statement-breakpoint

-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views)
VALUES ((SELECT id FROM blogs WHERE slug = 'scoped-custom-element-registries'), 0)
ON CONFLICT (blog_id) DO NOTHING;--> statement-breakpoint

-- タグ紐付け (JavaScript, Baseline 2026, Scoped custom element registries)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'scoped-custom-element-registries'),
  (SELECT id FROM tags WHERE name = 'JavaScript')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'scoped-custom-element-registries'),
  (SELECT id FROM tags WHERE name = 'Baseline 2026')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'scoped-custom-element-registries'),
  (SELECT id FROM tags WHERE name = 'Scoped custom element registries')
) ON CONFLICT DO NOTHING;
