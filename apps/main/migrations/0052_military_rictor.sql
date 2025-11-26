INSERT INTO tags (id, name) VALUES (82, 'view-transitions');
INSERT INTO tags (id, name) VALUES (83, 'view-transition-class');

INSERT INTO blogs (id, slug, published) VALUES (35, 'view-transitions', true);
INSERT INTO blog_views (blog_id, views) VALUES (35, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (35, 10);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (35, 30);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (35, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (35, 82);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (35, 83);
