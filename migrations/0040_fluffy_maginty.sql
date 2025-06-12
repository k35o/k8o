INSERT INTO tags (id, name) VALUES (56, 'QRKit');
INSERT INTO tags (id, name) VALUES (57, 'qr code');

INSERT INTO services (id, name, slug, type) VALUES (12, 'QRKit', 'qr-generator', 2);
INSERT INTO service_tag (service_id, tag_id) VALUES (12, 35);
INSERT INTO service_tag (service_id, tag_id) VALUES (12, 56);
INSERT INTO service_tag (service_id, tag_id) VALUES (12, 57);