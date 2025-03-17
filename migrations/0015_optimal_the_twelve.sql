-- Custom SQL migration file, put your code below! --INSERT INTO tags (id, name) VALUES (17, 'Intl');
INSERT INTO tags (id, name) VALUES (19, 'Popover API');

INSERT INTO blogs (id, title, description, slug) VALUES (8, 'Popover APIを使ってJavaScriptなしで要素の側に異なる要素を表示する', '', 'popover');
INSERT INTO blog_views (blog_id, views) VALUES (8, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (8, 10);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (8, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (8, 19);
