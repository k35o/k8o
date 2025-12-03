-- Custom SQL migration file, put your code below! --regexp-escape

INSERT INTO tags (id, name) VALUES (47, '正規表現');
INSERT INTO tags (id, name) VALUES (48, 'RegExp');
INSERT INTO tags (id, name) VALUES (49, 'RegExp.escape');

INSERT INTO blogs (id, slug, published) VALUES (16, 'regexp-escape', true);
INSERT INTO blog_views (blog_id, views) VALUES (16, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (16, 10);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (16, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (16, 47);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (16, 48);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (16, 49);
