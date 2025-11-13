INSERT INTO tags (id, name) VALUES (25, 'Atomics');
INSERT INTO tags (id, name) VALUES (26, 'Atomics.pause');

INSERT INTO blogs (id, slug) VALUES (11, 'atomics-pause');
INSERT INTO blog_views (blog_id, views) VALUES (11, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (11, 10);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (11, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (11, 25);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (11, 26);
