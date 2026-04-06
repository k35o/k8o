INSERT INTO tags (id, name) VALUES (120, 'Chromatic');--> statement-breakpoint
INSERT INTO tags (id, name) VALUES (121, 'MCP');--> statement-breakpoint
INSERT INTO blogs (id, slug, published, created_at)
VALUES (61, 'chromatic-storybook-publish', 1, '2026-04-06T00:00:00.000Z');--> statement-breakpoint
INSERT INTO blog_views (blog_id, views) VALUES (61, 0);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (61, 64);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (61, 120);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (61, 121);
