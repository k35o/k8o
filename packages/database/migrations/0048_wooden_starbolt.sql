-- 新しいタグの追加
INSERT INTO tags (id, name) VALUES (136, 'toggleevent-source');--> statement-breakpoint
-- ブログレコードの追加
INSERT INTO blogs (id, slug, published, created_at)
VALUES (72, 'toggleevent-source', 1, '2026-05-23T00:00:00.000Z');--> statement-breakpoint
-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views) VALUES (72, 0);--> statement-breakpoint
-- タグ紐付け (HTML: 15, Popover API: 19, Baseline 2026: 99, toggleevent-source: 136)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (72, 15);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (72, 19);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (72, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (72, 136);
