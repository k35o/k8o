INSERT INTO tags (id, name) VALUES (10, 'JavaScript');
INSERT INTO tags (id, name) VALUES (11, 'Baseline 2025');
INSERT INTO tags (id, name) VALUES (12, 'Promise');
INSERT INTO tags (id, name) VALUES (13, 'Promise.try');

INSERT INTO blogs (id, title, description, slug, created_at, updated_at) VALUES (5, '関数の同期・非同期を気にせず処理するPromise.tryとは', '', 'promise-try', '2025-03-08 20:00:00+00', '2025-03-08 20:00:00+00');
INSERT INTO blog_views (blog_id, views) VALUES (5, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (5, 10);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (5, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (5, 12);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (5, 13);
