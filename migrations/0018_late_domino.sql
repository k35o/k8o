INSERT INTO tags (id, name) VALUES (21, 'Baseline 2024');
INSERT INTO tags (id, name) VALUES (22, 'Clipboard API');
INSERT INTO tags (id, name) VALUES (23, 'ClipboardItem');
INSERT INTO tags (id, name) VALUES (24, 'ClipboardItem supports');

INSERT INTO blogs (id, title, description, slug) VALUES (10, '任意のデータをコピー&ペーストするAsync Clipboard API', 'Clipboard APIは、navigator.clipboardを通じてクリップボードへの読み書きを非同期で行えるAPIです。テキストや画像のコピー・貼り付けに対応し、ClipboardItemを使えばMIMEタイプ別のデータ操作も可能です。', 'async-clipboard');
INSERT INTO blog_views (blog_id, views) VALUES (10, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (10, 10);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (10, 11);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (10, 21);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (10, 22);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (10, 23);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (10, 24);
