INSERT INTO tags (id, name) VALUES (17, 'Intl');
INSERT INTO tags (id, name) VALUES (18, 'Intl.DurationFormat');

INSERT INTO blogs (id, title, description, slug) VALUES (7, 'Intl.DurationFormatで期間を日本語で表現する', '', 'intl-duration-format');
INSERT INTO blog_views (blog_id, views) VALUES (7, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (7, 10);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (7, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (7, 17);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (7, 18);
