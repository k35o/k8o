INSERT INTO tags (id, name) VALUES (117, 'Reporting API');--> statement-breakpoint
INSERT INTO blogs (id, slug, published, created_at)
VALUES (58, 'reporting', 1, '2026-04-03T00:00:00.000Z');--> statement-breakpoint
INSERT INTO blog_views (blog_id, views) VALUES (58, 0);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (58, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (58, 117);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (58, 10);
