INSERT INTO tags (id, name) VALUES (111, 'Trusted Types');--> statement-breakpoint
INSERT INTO tags (id, name) VALUES (112, 'CSP');--> statement-breakpoint
INSERT INTO blogs (id, slug, published, created_at)
VALUES (55, 'trusted-types', 1, '2026-03-08T00:00:00.000Z');--> statement-breakpoint
INSERT INTO blog_views (blog_id, views) VALUES (55, 0);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (55, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (55, 10);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (55, 111);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (55, 112);
