INSERT INTO tags (id, name) VALUES (31, 'TSKaigi');
INSERT INTO tags (id, name) VALUES (32, 'useReducer');
INSERT INTO tags (id, name) VALUES (33, '@types/react');

INSERT INTO blogs (id, slug, published) VALUES (15, 'react19-usereducer-ts-type-inference', false);
INSERT INTO blog_views (blog_id, views) VALUES (15, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (15, 1);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (15, 2);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (15, 31);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (15, 32);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (15, 33);
