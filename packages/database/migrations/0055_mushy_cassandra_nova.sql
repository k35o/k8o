INSERT INTO tags (id, name) VALUES (86, '@scope');

INSERT INTO blogs (id, slug, published) VALUES (38, 'scope', true);
INSERT INTO blog_views (blog_id, views) VALUES (38, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (38, 30);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (38, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (38, 86);