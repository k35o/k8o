INSERT INTO tags (id, name) VALUES (110, 'Navigation API');--> statement-breakpoint
INSERT INTO blogs (id, slug, published, created_at)
VALUES (54, 'navigation', 1, '2026-03-03T00:00:00.000Z');--> statement-breakpoint
INSERT INTO blog_views (blog_id, views) VALUES (54, 0);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (54, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (54, 10);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (54, 110);
