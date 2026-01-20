-- Custom SQL migration file, put your code below! --
-- 新しいタグを追加
INSERT INTO tags (id, name) VALUES (99, 'Baseline 2026');--> statement-breakpoint
INSERT INTO tags (id, name) VALUES (100, 'rcap');--> statement-breakpoint
INSERT INTO tags (id, name) VALUES (101, 'rch');--> statement-breakpoint
INSERT INTO tags (id, name) VALUES (102, 'rex');--> statement-breakpoint
INSERT INTO tags (id, name) VALUES (103, 'ric');--> statement-breakpoint

-- ブログレコード
INSERT INTO blogs (id, slug, published, created_at)
VALUES (49, 'root-font-units', 1, '2026-01-20T00:00:00.000Z');--> statement-breakpoint

-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views) VALUES (49, 0);--> statement-breakpoint

-- タグ紐付け (CSS: 30, Baseline 2026: 99, rcap: 100, rch: 101, rex: 102, ric: 103)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (49, 30);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (49, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (49, 100);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (49, 101);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (49, 102);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (49, 103);
