-- 新しいタグの追加
INSERT INTO tags (id, name) VALUES (129, 'csp-violation-reports');--> statement-breakpoint
-- ブログレコードの追加
INSERT INTO blogs (id, slug, published, created_at)
VALUES (66, 'csp-violation-reports', 1, '2026-05-15T00:00:00.000Z');--> statement-breakpoint
-- ビューカウント初期化
INSERT INTO blog_views (blog_id, views) VALUES (66, 0);--> statement-breakpoint
-- タグ紐付け (Baseline 2026: 99, CSP: 112, Reporting API: 117, csp-violation-reports: 129)
INSERT INTO blog_tag (blog_id, tag_id) VALUES (66, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (66, 112);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (66, 117);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (66, 129);
