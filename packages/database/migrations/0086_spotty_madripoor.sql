-- 新しいタグの追加（既存なら何もしない）
INSERT INTO tags (name) VALUES ('revert-rule') ON CONFLICT (name) DO NOTHING;--> statement-breakpoint

-- ブログレコードの追加（slug が一意なので id は書かない）
INSERT INTO blogs (slug, published, created_at)
VALUES ('revert-rule', 1, '2026-10-20T00:00:00.000Z') ON CONFLICT (slug) DO NOTHING;--> statement-breakpoint

-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views)
VALUES ((SELECT id FROM blogs WHERE slug = 'revert-rule'), 0)
ON CONFLICT (blog_id) DO NOTHING;--> statement-breakpoint

-- タグ紐付け (CSS, Baseline 2026, revert-rule)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'revert-rule'),
  (SELECT id FROM tags WHERE name = 'CSS')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'revert-rule'),
  (SELECT id FROM tags WHERE name = 'Baseline 2026')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'revert-rule'),
  (SELECT id FROM tags WHERE name = 'revert-rule')
) ON CONFLICT DO NOTHING;
