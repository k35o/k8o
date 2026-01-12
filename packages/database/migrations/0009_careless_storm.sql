INSERT INTO tags (id, name) VALUES (94, 'font-family: math');--> statement-breakpoint
INSERT INTO blogs (id, slug, published, created_at) VALUES (44, 'font-family-math', 1, '2026-01-12T00:00:00.000Z');--> statement-breakpoint
INSERT INTO blog_views (blog_id, views) VALUES (44, 0);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (44, 30);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (44, 11);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (44, 94);