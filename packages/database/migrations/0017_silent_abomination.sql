-- 新しいタグを追加
INSERT INTO tags (id, name) VALUES (106, 'zstd');--> statement-breakpoint

-- ブログレコード
INSERT INTO blogs (id, slug, published, created_at)
VALUES (52, 'zstd', 1, '2026-03-02T00:00:00.000Z');--> statement-breakpoint

-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views) VALUES (52, 0);--> statement-breakpoint

-- タグ紐付け (Baseline 2026: 99, zstd: 106)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (52, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (52, 106);
