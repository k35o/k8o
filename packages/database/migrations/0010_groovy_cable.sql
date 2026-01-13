-- 新しいタグ
INSERT INTO tags (id, name) VALUES (95, 'Invoker Commands API');--> statement-breakpoint

-- ブログレコード
INSERT INTO blogs (id, slug, published, created_at)
VALUES (45, 'invoker-commands', 1, '2026-01-13T00:00:00.000Z');--> statement-breakpoint

-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views) VALUES (45, 0);--> statement-breakpoint

-- タグ紐付け
INSERT INTO blog_tag (blog_id, tag_id) VALUES (45, 11);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (45, 15);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (45, 95);
