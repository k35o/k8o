-- 新しいタグの追加
INSERT INTO tags (id, name) VALUES (137, ':open');--> statement-breakpoint
-- ブログレコードの追加
INSERT INTO blogs (id, slug, published, created_at)
VALUES (73, 'open-pseudo', 1, '2026-05-23T00:00:00.000Z');--> statement-breakpoint
-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views) VALUES (73, 0);--> statement-breakpoint
-- タグ紐付け (CSS: 30, Baseline 2026: 99, :open: 137)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (73, 30);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (73, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (73, 137);
