-- 新しいタグの追加
INSERT INTO tags (id, name) VALUES (130, 'shared-worker');--> statement-breakpoint
-- ブログレコードの追加
INSERT INTO blogs (id, slug, published, created_at)
VALUES (67, 'shared-worker', 1, '2026-05-15T00:00:00.000Z');--> statement-breakpoint
-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views) VALUES (67, 0);--> statement-breakpoint
-- タグ紐付け (JavaScript: 10, Baseline 2026: 99, shared-worker: 130)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (67, 10);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (67, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (67, 130);
