INSERT INTO tags (id, name) VALUES (64, 'storybook');
INSERT INTO tags (id, name) VALUES (65, 'test');
INSERT INTO tags (id, name) VALUES (66, 'mock');

INSERT INTO blogs (id, slug, published) VALUES (25, 'sb-mock', true);
INSERT INTO blog_views (blog_id, views) VALUES (25, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (25, 2);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (25, 64);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (25, 65);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (25, 66);
