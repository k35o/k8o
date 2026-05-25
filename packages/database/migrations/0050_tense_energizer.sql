-- 新しいタグの追加
INSERT INTO tags (id, name) VALUES (138, 'Container Queries');--> statement-breakpoint
INSERT INTO tags (id, name) VALUES (139, 'Container Style Queries');--> statement-breakpoint
-- ブログレコードの追加
INSERT INTO blogs (id, slug, published, created_at)
VALUES (74, 'container-style-queries', 1, '2026-05-26T00:00:00.000Z');--> statement-breakpoint
-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views) VALUES (74, 0);--> statement-breakpoint
-- タグ紐付け (CSS: 30, Baseline 2026: 99, Container Queries: 138, Container Style Queries: 139)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (74, 30);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (74, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (74, 138);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (74, 139);
