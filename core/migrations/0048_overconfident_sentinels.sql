INSERT INTO tags (id, name) VALUES (74, 'URLPattern');
INSERT INTO tags (id, name) VALUES (75, 'parseHTMLUnsafe');
INSERT INTO tags (id, name) VALUES (76, '<link rel="dns-prefetch">');
INSERT INTO tags (id, name) VALUES (77, 'content-visibility');

INSERT INTO blogs (id, slug, published) VALUES (29, 'urlpattern', true);
INSERT INTO blog_views (blog_id, views) VALUES (29, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (29, 10);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (29, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (29, 47);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (29, 74);

INSERT INTO blogs (id, slug, published) VALUES (30, 'parse-html-unsafe', false);
INSERT INTO blog_views (blog_id, views) VALUES (30, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (30, 10);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (30, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (30, 15);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (30, 75);

INSERT INTO blogs (id, slug, published) VALUES (31, 'link-rel-dns-prefetch', true);
INSERT INTO blog_views (blog_id, views) VALUES (31, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (31, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (31, 15);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (31, 76);

INSERT INTO blogs (id, slug, published) VALUES (32, 'content-visibility', true);
INSERT INTO blog_views (blog_id, views) VALUES (32, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (32, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (32, 30);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (32, 77);
