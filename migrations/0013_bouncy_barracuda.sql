INSERT INTO tags (id, name) VALUES (14, 'contenteditable');
INSERT INTO tags (id, name) VALUES (15, 'HTML');
INSERT INTO tags (id, name) VALUES (16, 'グローバル属性');

INSERT INTO blogs (id, title, description, slug) VALUES (6, 'contenteditableな要素でテキストだけを編集可能にする', '', 'contenteditable-plaintextonly');
INSERT INTO blog_views (blog_id, views) VALUES (6, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (6, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (6, 14);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (6, 15);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (6, 16);
