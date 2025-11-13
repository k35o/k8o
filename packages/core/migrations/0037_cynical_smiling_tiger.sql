INSERT INTO tags (id, name) VALUES (53, 'dialog');
INSERT INTO tags (id, name) VALUES (54, 'requestclose');

INSERT INTO blogs (id, slug, published) VALUES (18, 'requestclose', true);
INSERT INTO blog_views (blog_id, views) VALUES (18, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (18, 10);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (18, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (18, 53);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (18, 54);
