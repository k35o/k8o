-- 新しいタグを追加
INSERT INTO tags (id, name) VALUES (107, 'Map');--> statement-breakpoint
INSERT INTO tags (id, name) VALUES (108, 'getOrInsert');--> statement-breakpoint
INSERT INTO tags (id, name) VALUES (109, 'getOrInsertComputed');--> statement-breakpoint

-- ブログレコード
INSERT INTO blogs (id, slug, published, created_at)
VALUES (53, 'getorinsert', 1, '2026-03-02T00:00:00.000Z');--> statement-breakpoint

-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views) VALUES (53, 0);--> statement-breakpoint

-- タグ紐付け (JavaScript: 10, Baseline 2026: 99, Map: 107, getOrInsert: 108, getOrInsertComputed: 109)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (53, 10);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (53, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (53, 107);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (53, 108);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (53, 109);
