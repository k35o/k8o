-- 新しいタグ
INSERT INTO tags (id, name) VALUES (105, 'Service Workers');--> statement-breakpoint

-- ブログレコード
INSERT INTO blogs (id, slug, published, created_at)
VALUES (51, 'js-modules-service-workers', 1, '2026-01-24T00:00:00.000Z');--> statement-breakpoint

-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views) VALUES (51, 0);--> statement-breakpoint

-- タグ紐付け（JavaScript: 10, Baseline 2026: 99, Service Workers: 105）
INSERT INTO blog_tag (blog_id, tag_id) VALUES (51, 10);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (51, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (51, 105);
