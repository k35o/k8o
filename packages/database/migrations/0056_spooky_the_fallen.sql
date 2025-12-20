INSERT INTO tags (id, name) VALUES (87, 'scroll');
INSERT INTO tags (id, name) VALUES (88, 'scrollend');

INSERT INTO blogs (id, slug, published) VALUES (39, 'scrollend', true);
INSERT INTO blog_views (blog_id, views) VALUES (39, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (39, 10);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (39, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (39, 87);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (39, 88);