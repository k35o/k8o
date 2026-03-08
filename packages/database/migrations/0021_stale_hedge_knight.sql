INSERT INTO tags (id, name) VALUES (113, 'shape()');--> statement-breakpoint
INSERT INTO blogs (id, slug, published, created_at)
VALUES (56, 'shape-function', 1, '2026-03-08T00:00:00.000Z');--> statement-breakpoint
INSERT INTO blog_views (blog_id, views) VALUES (56, 0);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (56, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (56, 30);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (56, 113);
