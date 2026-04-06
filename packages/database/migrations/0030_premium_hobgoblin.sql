INSERT INTO tags (id, name) VALUES (119, 'Iterator.concat()');--> statement-breakpoint
INSERT INTO blogs (id, slug, published, created_at)
VALUES (60, 'iterator-concat', 1, '2026-04-06T00:00:00.000Z');--> statement-breakpoint
INSERT INTO blog_views (blog_id, views) VALUES (60, 0);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (60, 10);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (60, 28);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (60, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (60, 119);
