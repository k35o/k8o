INSERT INTO tags (id, name) VALUES (80, 'details-content');
INSERT INTO tags (id, name) VALUES (81, '<details>');

INSERT INTO blogs (id, slug, published) VALUES (34, 'details-content', true);
INSERT INTO blog_views (blog_id, views) VALUES (34, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (34, 30);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (34, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (34, 80);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (34, 81);
