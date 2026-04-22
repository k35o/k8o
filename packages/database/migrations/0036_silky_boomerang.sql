INSERT INTO tags (id, name) VALUES (123, 'Hono');--> statement-breakpoint
INSERT INTO tags (id, name) VALUES (124, 'Hono JSX');--> statement-breakpoint
INSERT INTO tags (id, name) VALUES (125, 'Vite');--> statement-breakpoint
INSERT INTO tags (id, name) VALUES (126, 'Vitest');--> statement-breakpoint
INSERT INTO blogs (id, slug, published, created_at)
VALUES (63, 'storybook-framework-hono-vite', 1, '2026-04-22T00:00:00.000Z');--> statement-breakpoint
INSERT INTO blog_views (blog_id, views) VALUES (63, 0);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (63, 64);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (63, 65);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (63, 123);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (63, 124);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (63, 125);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (63, 126);
