-- 新しいタグの追加
INSERT INTO tags (id, name) VALUES (127, 'Math.sumPrecise()');--> statement-breakpoint
-- ブログレコードの追加
INSERT INTO blogs (id, slug, published, created_at)
VALUES (64, 'math-sum-precise', 1, '2026-04-25T00:00:00.000Z');--> statement-breakpoint
-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views) VALUES (64, 0);--> statement-breakpoint
-- タグ紐付け (JavaScript: 10, Baseline 2026: 99, Math.sumPrecise(): 127)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (64, 10);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (64, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (64, 127);
