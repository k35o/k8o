-- Custom SQL migration file, put your code below! --
-- 新しいタグを追加
INSERT INTO tags (id, name) VALUES (104, ':active-view-transition-type');--> statement-breakpoint

-- ブログレコード
INSERT INTO blogs (id, slug, published, created_at)
VALUES (50, 'active-view-transition', 1, '2026-01-22T00:00:00.000Z');--> statement-breakpoint

-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views) VALUES (50, 0);--> statement-breakpoint

-- タグ紐付け (CSS: 30, view-transitions: 82, Baseline 2026: 99, :active-view-transition-type: 104)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (50, 30);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (50, 82);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (50, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (50, 104);
