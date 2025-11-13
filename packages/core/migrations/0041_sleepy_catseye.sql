INSERT INTO tags (id, name) VALUES (58, 'suspense');
INSERT INTO tags (id, name) VALUES (59, 'suspense-list');

INSERT INTO blogs (id, slug, published) VALUES (21, 'suspense-list', true);
INSERT INTO blog_views (blog_id, views) VALUES (21, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (21, 2);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (21, 58);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (21, 59);
