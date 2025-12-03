INSERT INTO tags (id, name) VALUES (67, 'npm');
INSERT INTO tags (id, name) VALUES (68, 'oidc');
INSERT INTO tags (id, name) VALUES (69, 'packages');
INSERT INTO tags (id, name) VALUES (70, 'GitHub Actions');
INSERT INTO tags (id, name) VALUES (71, 'Changesets');

INSERT INTO blogs (id, slug, published) VALUES (26, 'npm-trusted-publishing-for-npm-packages', true);
INSERT INTO blog_views (blog_id, views) VALUES (26, 0);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (26, 67);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (26, 68);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (26, 69);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (26, 70);
INSERT INTO blog_tag (blog_id, tag_id) VALUES (26, 71);
