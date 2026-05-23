-- 新しいタグの追加
INSERT INTO tags (id, name) VALUES (133, 'WebAssembly');--> statement-breakpoint
INSERT INTO tags (id, name) VALUES (134, 'wasm-branch-hinting');--> statement-breakpoint
-- ブログレコードの追加
INSERT INTO blogs (id, slug, published, created_at)
VALUES (70, 'wasm-branch-hinting', 1, '2026-05-23T00:00:00.000Z');--> statement-breakpoint
-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views) VALUES (70, 0);--> statement-breakpoint
-- タグ紐付け (Baseline 2026: 99, WebAssembly: 133, wasm-branch-hinting: 134)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (70, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (70, 133);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (70, 134);
