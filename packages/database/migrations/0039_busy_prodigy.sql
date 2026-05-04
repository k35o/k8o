-- 新しいタグの追加
INSERT INTO tags (id, name) VALUES (128, 'contrast-color');--> statement-breakpoint
-- ブログレコードの追加
INSERT INTO blogs (id, slug, published, created_at)
VALUES (65, 'contrast-color', 1, '2026-05-03T00:00:00.000Z');--> statement-breakpoint
-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views) VALUES (65, 0);--> statement-breakpoint
-- タグ紐付け (color contrast: 4, color: 8, CSS: 30, Baseline 2026: 99, contrast-color: 128)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (65, 4);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (65, 8);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (65, 30);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (65, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (65, 128);
