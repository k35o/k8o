-- 新しいタグの追加（既存なら何もしない）
INSERT INTO tags (name) VALUES (':playing') ON CONFLICT (name) DO NOTHING;--> statement-breakpoint
INSERT INTO tags (name) VALUES (':paused') ON CONFLICT (name) DO NOTHING;--> statement-breakpoint
INSERT INTO tags (name) VALUES (':muted') ON CONFLICT (name) DO NOTHING;--> statement-breakpoint

-- ブログレコードの追加（slug が一意なので id は書かない）。Chrome 155 の出荷を待つため未公開で投入し、admin から公開する
INSERT INTO blogs (slug, published, created_at)
VALUES ('media-pseudos', 0, '2026-09-09T00:00:00.000Z') ON CONFLICT (slug) DO NOTHING;--> statement-breakpoint

-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views)
VALUES ((SELECT id FROM blogs WHERE slug = 'media-pseudos'), 0)
ON CONFLICT (blog_id) DO NOTHING;--> statement-breakpoint

-- タグ紐付け (CSS, Baseline 2026, :playing, :paused, :muted)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'media-pseudos'),
  (SELECT id FROM tags WHERE name = 'CSS')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'media-pseudos'),
  (SELECT id FROM tags WHERE name = 'Baseline 2026')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'media-pseudos'),
  (SELECT id FROM tags WHERE name = ':playing')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'media-pseudos'),
  (SELECT id FROM tags WHERE name = ':paused')
) ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (
  (SELECT id FROM blogs WHERE slug = 'media-pseudos'),
  (SELECT id FROM tags WHERE name = ':muted')
) ON CONFLICT DO NOTHING;
