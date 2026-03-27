-- 新しいタグを追加
INSERT INTO tags (id, name) VALUES (114, 'text-indent');--> statement-breakpoint
INSERT INTO tags (id, name) VALUES (115, 'text-indent: each-line');--> statement-breakpoint
INSERT INTO tags (id, name) VALUES (116, 'text-indent: hanging');--> statement-breakpoint

-- ブログレコード
INSERT INTO blogs (id, slug, published, created_at)
VALUES (57, 'text-indent-keywords', 1, '2026-03-27T00:00:00.000Z');--> statement-breakpoint

-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views) VALUES (57, 0);--> statement-breakpoint

-- タグ紐付け (CSS: 30, Baseline 2026: 99, text-indent: 114, text-indent: each-line: 115, text-indent: hanging: 116)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (57, 30);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (57, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (57, 114);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (57, 115);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (57, 116);
