INSERT INTO tags (id, name) VALUES (118, 'Streams API');--> statement-breakpoint
INSERT INTO blogs (id, slug, published, created_at)
VALUES (59, 'readable-byte-streams', 1, '2026-04-05T00:00:00.000Z');--> statement-breakpoint
INSERT INTO blog_views (blog_id, views) VALUES (59, 0);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (59, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (59, 118);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (59, 10);
