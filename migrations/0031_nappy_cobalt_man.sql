INSERT INTO service_type (id, name) VALUES (1, 'Forge');
INSERT INTO service_type (id, name) VALUES (2, 'Assist');

INSERT INTO tags (id, name) VALUES (34, 'Forge');
INSERT INTO tags (id, name) VALUES (35, 'Assist');
INSERT INTO tags (id, name) VALUES (36, 'デザイン');
INSERT INTO tags (id, name) VALUES (37, 'Arte Odyssey');
INSERT INTO tags (id, name) VALUES (38, '文字列');
INSERT INTO tags (id, name) VALUES (39, 'Linter');
INSERT INTO tags (id, name) VALUES (40, '数値');
INSERT INTO tags (id, name) VALUES (41, 'RGB');
INSERT INTO tags (id, name) VALUES (42, 'HEX');
INSERT INTO tags (id, name) VALUES (43, 'HSL');
INSERT INTO tags (id, name) VALUES (44, 'SQL');
INSERT INTO tags (id, name) VALUES (45, '漢字');
INSERT INTO tags (id, name) VALUES (46, '日本語');

INSERT INTO services (id, name, slug, type) VALUES (1, 'Blog', 'blog', 1);
INSERT INTO service_tag (service_id, tag_id) VALUES (1, 34);

INSERT INTO services (id, name, slug, type) VALUES (2, 'Talks', 'talks', 1);
INSERT INTO service_tag (service_id, tag_id) VALUES (2, 34);

INSERT INTO services (id, name, slug, type) VALUES (3, 'ArteOdyssey', 'design-system', 1);
INSERT INTO service_tag (service_id, tag_id) VALUES (3, 34);
INSERT INTO service_tag (service_id, tag_id) VALUES (3, 36);
INSERT INTO service_tag (service_id, tag_id) VALUES (3, 37);

INSERT INTO services (id, name, slug, type) VALUES (4, 'もじカウント', 'moji-count', 2);
INSERT INTO service_tag (service_id, tag_id) VALUES (4, 35);
INSERT INTO service_tag (service_id, tag_id) VALUES (4, 38);

INSERT INTO services (id, name, slug, type) VALUES (5, '日本語校正くん', 'japanese-text-fixer', 2);
INSERT INTO service_tag (service_id, tag_id) VALUES (5, 35);
INSERT INTO service_tag (service_id, tag_id) VALUES (5, 38);
INSERT INTO service_tag (service_id, tag_id) VALUES (5, 39);
INSERT INTO service_tag (service_id, tag_id) VALUES (5, 46);

INSERT INTO services (id, name, slug, type) VALUES (6, '基数チェンジャー', 'base-converter', 2);
INSERT INTO service_tag (service_id, tag_id) VALUES (6, 35);
INSERT INTO service_tag (service_id, tag_id) VALUES (6, 40);

INSERT INTO services (id, name, slug, type) VALUES (7, 'コントラストチェッカー', 'contrast-checker', 2);
INSERT INTO service_tag (service_id, tag_id) VALUES (7, 35);
INSERT INTO service_tag (service_id, tag_id) VALUES (7, 4);
INSERT INTO service_tag (service_id, tag_id) VALUES (7, 8);

INSERT INTO services (id, name, slug, type) VALUES (8, 'カラーコード職人', 'color-converter', 2);
INSERT INTO service_tag (service_id, tag_id) VALUES (8, 35);
INSERT INTO service_tag (service_id, tag_id) VALUES (8, 8);
INSERT INTO service_tag (service_id, tag_id) VALUES (8, 41);
INSERT INTO service_tag (service_id, tag_id) VALUES (8, 42);
INSERT INTO service_tag (service_id, tag_id) VALUES (8, 43);

INSERT INTO services (id, name, slug, type) VALUES (9, 'かどまるラボ', 'radius-maker', 2);
INSERT INTO service_tag (service_id, tag_id) VALUES (9, 35);
INSERT INTO service_tag (service_id, tag_id) VALUES (9, 36);

INSERT INTO services (id, name, slug, type) VALUES (10, 'SQLテーブルメーカー', 'sql-table-builder', 2);
INSERT INTO service_tag (service_id, tag_id) VALUES (10, 35);
INSERT INTO service_tag (service_id, tag_id) VALUES (10, 44);

INSERT INTO services (id, name, slug, type) VALUES (11, 'Quizzes', 'quizzes', 2);
INSERT INTO service_tag (service_id, tag_id) VALUES (11, 35);
INSERT INTO service_tag (service_id, tag_id) VALUES (11, 45);
