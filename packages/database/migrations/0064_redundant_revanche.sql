-- 新しいタグの追加（既存なら何もしない）
INSERT INTO tags (name) VALUES ('pnpm') ON CONFLICT (name) DO NOTHING;--> statement-breakpoint

-- ブログレコードの追加（slug が一意なので id は書かない）
INSERT INTO blogs (slug, published, created_at)
VALUES ('pnpm-release-action', 1, '2026-07-23T00:00:00.000Z') ON CONFLICT (slug) DO NOTHING;--> statement-breakpoint

-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views)
VALUES ((SELECT id FROM blogs WHERE slug = 'pnpm-release-action'), 0)
ON CONFLICT (blog_id) DO NOTHING;--> statement-breakpoint

-- タグ紐付け (pnpm, GitHub Actions, npm, Changesets)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'pnpm-release-action'),
  (SELECT id FROM tags WHERE name = 'pnpm')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'pnpm-release-action'),
  (SELECT id FROM tags WHERE name = 'GitHub Actions')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'pnpm-release-action'),
  (SELECT id FROM tags WHERE name = 'npm')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'pnpm-release-action'),
  (SELECT id FROM tags WHERE name = 'Changesets')
) ON CONFLICT DO NOTHING;
