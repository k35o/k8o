INSERT INTO tags (id, name) VALUES (78, 'webrtc');
INSERT INTO tags (id, name) VALUES (79, 'webrtc-encoded-transform');

INSERT INTO blogs (id, slug, published) VALUES (33, 'webrtc-encoded-transform', true);
INSERT INTO blog_views (blog_id, views) VALUES (33, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (33, 10);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (33, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (33, 78);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (33, 79);