INSERT INTO tags (id, name) VALUES (50, 'json-modules');
INSERT INTO tags (id, name) VALUES (51, 'with');
INSERT INTO tags (id, name) VALUES (52, 'import');

INSERT INTO blogs (id, slug, published) VALUES (17, 'json-modules', true);
INSERT INTO blog_views (blog_id, views) VALUES (17, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (17, 10);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (17, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (17, 50);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (17, 51);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (17, 52);
