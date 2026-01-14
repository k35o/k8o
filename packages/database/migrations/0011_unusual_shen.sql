-- Custom SQL migration file, put your code below! --

-- 新しいタグを追加
INSERT INTO tags (id, name) VALUES (96, 'cloneElement');--> statement-breakpoint
INSERT INTO tags (id, name) VALUES (97, 'render props');--> statement-breakpoint
INSERT INTO tags (id, name) VALUES (98, 'satisfies');--> statement-breakpoint

-- ブログレコード: react-children-props
INSERT INTO blogs (id, slug, published, created_at)
VALUES (47, 'react-children-props', 1, '2023-05-20T00:00:00.000Z');--> statement-breakpoint
INSERT INTO blog_views (blog_id, views) VALUES (47, 0);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (47, 2);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (47, 96);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (47, 97);--> statement-breakpoint

-- ブログレコード: typescript-satisfies-narrowing
INSERT INTO blogs (id, slug, published, created_at)
VALUES (48, 'typescript-satisfies-narrowing', 1, '2023-07-10T00:00:00.000Z');--> statement-breakpoint
INSERT INTO blog_views (blog_id, views) VALUES (48, 0);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (48, 1);--> statement-breakpoint
INSERT INTO blog_tag (blog_id, tag_id) VALUES (48, 98);
