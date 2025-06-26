INSERT INTO tags (id, name) VALUES (60, 'abs');
INSERT INTO tags (id, name) VALUES (61, 'sign');

INSERT INTO blogs (id, slug, published) VALUES (22, 'abs-sign', true);
INSERT INTO blog_views (blog_id, views) VALUES (22, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (22, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (22, 30);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (22, 60);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (22, 61);
