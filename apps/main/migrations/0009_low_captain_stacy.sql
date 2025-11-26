TRUNCATE TABLE blogs CASCADE;
TRUNCATE TABLE tags CASCADE;
TRUNCATE TABLE blog_views CASCADE;
TRUNCATE TABLE blog_tag CASCADE;

INSERT INTO tags (id, name) VALUES (1, 'TypeScript');
INSERT INTO tags (id, name) VALUES (2, 'React');
INSERT INTO tags (id, name) VALUES (3, 'TanStack Router');
INSERT INTO tags (id, name) VALUES (4, 'color contrast');
INSERT INTO tags (id, name) VALUES (5, 'a11y');
INSERT INTO tags (id, name) VALUES (6, 'WCAG');
INSERT INTO tags (id, name) VALUES (7, 'W3C');
INSERT INTO tags (id, name) VALUES (8, 'color');
INSERT INTO tags (id, name) VALUES (9, 'daily');

INSERT INTO blogs (id, title, description, slug, created_at, updated_at) VALUES (1, 'Reactの新しいルーティングライブラリ、TanStackRouterを学ぶ', 'Reactのルーティングには主にNextjs等のフレームワークやReact Routeが利用されます。この記事では新たなルーティング手法の選択肢としてTanStack Routerを紹介します。TanStack Routerでは最初に挙げた選択肢の使い心地を踏襲しつつ、ルーティングやサーチパラメータの型安全性や他にない便利な機能を提供します。', 'tanstack-router-introduction', '2023-07-13 00:00:00+00', '2024-09-28 00:00:00+00');
INSERT INTO blog_views (blog_id, views) VALUES (1, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (1, 1);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (1, 2);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (1, 3);

INSERT INTO blogs (id, title, description, slug, created_at, updated_at) VALUES (2, '色のコントラスト比は重要だけどどうやって求めるんだっけ？', 'WCAG 2.1では背景色とテキスト色のコントラスト比についての達成基準が定められています。コントラスト比とは何でしょうか？コントラスト比の計算はツールを用いることが多いので、その計算方法を理解せずに検査している方は少なくないです。この記事ではコントラスト比の計算方法を理解して、そこから読み取れる重要な情報を紐解きます。', 'color-contrast', '2024-02-12 00:00:00+00', '2024-09-28 00:00:00+00');
INSERT INTO blog_views (blog_id, views) VALUES (2, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (2, 4);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (2, 5);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (2, 6);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (2, 7);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (2, 8);

INSERT INTO blogs (id, title, description, slug, created_at, updated_at) VALUES (3, '色覚タイプとその分類', '色の見え方が多数に比べ大きく異なる「色覚特性」を先天的に持つ人は日本人男性全体の約5%存在します。この記事では色覚特性とその分類について紹介し、当サイトが提供するシミュレーションの利用法について説明します。', 'color-perception', '2024-10-14 10:55:22.080847+00', '2024-10-14 10:55:22.080847+00');
INSERT INTO blog_views (blog_id, views) VALUES (3, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (3, 8);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (3, 5);

INSERT INTO blogs (id, title, description, slug, created_at, updated_at) VALUES (4, '色彩検定UC級に合格しました！', '', 'color-certification-uc', '2024-12-18 13:58:40.58382+00', '2024-12-24 10:06:24.726511+00');
INSERT INTO blog_views (blog_id, views) VALUES (4, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (4, 8);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (4, 9);
