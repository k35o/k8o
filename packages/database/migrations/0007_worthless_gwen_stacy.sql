INSERT INTO tags (id, name) VALUES (90, 'Performance API');--> statement-breakpoint
INSERT INTO tags (id, name) VALUES (91, 'PerformanceEventTiming');--> statement-breakpoint
INSERT INTO tags (id, name) VALUES (92, 'LCP');--> statement-breakpoint
INSERT INTO blogs (id, slug, published, created_at) VALUES (41, 'event-timing', 1, '2025-12-30T00:00:00.000Z');--> statement-breakpoint
INSERT INTO blog_views (blog_id, views) VALUES (41, 0);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (41, 10);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (41, 11);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (41, 90);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (41, 91);--> statement-breakpoint
INSERT INTO blogs (id, slug, published, created_at) VALUES (42, 'largest-contentful-paint', 1, '2025-12-30T00:00:00.000Z');--> statement-breakpoint
INSERT INTO blog_views (blog_id, views) VALUES (42, 0);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (42, 10);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (42, 11);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (42, 90);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (42, 92);

