INSERT INTO tags (id, name) VALUES (62, 'highlight');
INSERT INTO tags (id, name) VALUES (63, 'spelling-grammar-error');

INSERT INTO blogs (id, slug, published) VALUES (23, 'highlight', true);
INSERT INTO blog_views (blog_id, views) VALUES (23, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (23, 10);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (23, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (23, 30);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (23, 62);


INSERT INTO blogs (id, slug, published) VALUES (24, 'spelling-grammar-error', true);
INSERT INTO blog_views (blog_id, views) VALUES (24, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (24, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (24, 30);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (24, 63);
