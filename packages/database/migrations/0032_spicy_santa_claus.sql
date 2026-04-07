-- font-family-math記事のBaselineタグを 2025 → 2026 に変更
DELETE FROM blog_tag WHERE blog_id = 44 AND tag_id = 11;--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (44, 99);
