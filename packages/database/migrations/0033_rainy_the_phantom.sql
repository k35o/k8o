INSERT INTO tags (id, name) VALUES (122, 'WebTransport');--> statement-breakpoint
INSERT INTO blogs (id, slug, published, created_at)
VALUES (62, 'webtransport', 1, '2026-04-07T00:00:00.000Z');--> statement-breakpoint
INSERT INTO blog_views (blog_id, views) VALUES (62, 0);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (62, 10);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (62, 99);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (62, 122);
