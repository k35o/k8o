-- 新しいタグの追加
INSERT INTO tags (id, name) VALUES (132, 'image-rendering');--> statement-breakpoint
-- ブログレコードの追加
INSERT INTO blogs (id, slug, published, created_at)
VALUES (69, 'crisp-edges', 1, '2026-05-16T00:00:00.000Z');--> statement-breakpoint
-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views) VALUES (69, 0);--> statement-breakpoint
-- タグ紐付け (CSS: 30, Baseline 2026: 99, image-rendering: 132)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (69, 30);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (69, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (69, 132);
