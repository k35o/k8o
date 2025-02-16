TRUNCATE TABLE quizzes CASCADE;
TRUNCATE TABLE quiz_type CASCADE;
TRUNCATE TABLE quiz_questions CASCADE;
TRUNCATE TABLE quiz_answers CASCADE;

INSERT INTO quiz_type (id, name) VALUES (1, 'うおへんを持つ漢字');

INSERT INTO quizzes (id, type) VALUES (1, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (1, 1, '漢字の読み方を答えよ', '鯏');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (1, 1, 'あさり');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (2, 1, 'うぐい');

INSERT INTO quizzes (id, type) VALUES (2, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (2, 2, '漢字の読み方を答えよ', '鯵');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (3, 2, 'あじ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (4, 2, 'そう');

INSERT INTO quizzes (id, type) VALUES (3, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (3, 3, '漢字の読み方を答えよ', '鮎');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (5, 3, 'あゆ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (6, 3, 'でん');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (7, 3, 'ねん');

INSERT INTO quizzes (id, type) VALUES (4, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (4, 4, '漢字の読み方を答えよ', '魚');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (8, 4, 'さかな');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (9, 4, 'うお');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (10, 4, 'ぎょ');

INSERT INTO quizzes (id, type) VALUES (5, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (5, 5, '漢字の読み方を答えよ', '魞');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (11, 5, 'えり');

INSERT INTO quizzes (id, type) VALUES (6, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (6, 6, '漢字の読み方を答えよ', '魳');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (12, 6, 'かます');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (13, 6, 'し');

INSERT INTO quizzes (id, type) VALUES (7, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (7, 7, '漢字の読み方を答えよ', '魸');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (14, 7, 'なまず');

INSERT INTO quizzes (id, type) VALUES (8, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (8, 8, '漢字の読み方を答えよ', '魬');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (15, 8, 'はまち');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (16, 8, 'はん');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (17, 8, 'ばん');

INSERT INTO quizzes (id, type) VALUES (9, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (9, 9, '漢字の読み方を答えよ', '魴');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (18, 9, 'おしきうお');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (19, 9, 'かがみだい');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (20, 9, 'ほう');

INSERT INTO quizzes (id, type) VALUES (10, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (10, 10, '漢字の読み方を答えよ', '魯');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (21, 10, 'おろか');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (22, 10, 'ろ');

INSERT INTO quizzes (id, type) VALUES (11, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (11, 11, '漢字の読み方を答えよ', '鮇');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (23, 11, 'いわな');

INSERT INTO quizzes (id, type) VALUES (12, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (12, 12, '漢字の読み方を答えよ', '鮖');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (24, 12, 'かじか');

INSERT INTO quizzes (id, type) VALUES (13, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (13, 13, '漢字の読み方を答えよ', '鮓');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (25, 13, 'すし');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (26, 13, 'さ');

INSERT INTO quizzes (id, type) VALUES (14, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (14, 14, '漢字の読み方を答えよ', '鮒');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (27, 14, 'ふな');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (28, 14, 'ふ');

INSERT INTO quizzes (id, type) VALUES (15, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (15, 15, '漢字の読み方を答えよ', '鮃');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (29, 15, 'ひらめ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (30, 15, 'へい');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (31, 15, 'ひょう');

INSERT INTO quizzes (id, type) VALUES (16, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (16, 16, '漢字の読み方を答えよ', '鮑');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (32, 16, 'あわび');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (33, 16, 'ほう');

INSERT INTO quizzes (id, type) VALUES (17, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (17, 17, '漢字の読み方を答えよ', '鮟');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (34, 17, 'あん');

INSERT INTO quizzes (id, type) VALUES (18, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (18, 18, '漢字の読み方を答えよ', '鮪');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (35, 18, 'まぐろ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (36, 18, 'しび');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (37, 18, 'い');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (38, 18, 'ゆう');

INSERT INTO quizzes (id, type) VALUES (19, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (19, 19, '漢字の読み方を答えよ', '鮱');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (39, 19, 'おおぼら');

INSERT INTO quizzes (id, type) VALUES (20, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (20, 20, '漢字の読み方を答えよ', '鮠');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (40, 20, 'はや');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (41, 20, 'はえ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (42, 20, 'がい');

INSERT INTO quizzes (id, type) VALUES (21, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (21, 21, '漢字の読み方を答えよ', '鮭');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (43, 21, 'さけ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (44, 21, 'さかな');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (45, 21, 'けい');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (46, 21, 'かい');

INSERT INTO quizzes (id, type) VALUES (22, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (22, 22, '漢字の読み方を答えよ', '鮫');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (47, 22, 'さめ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (48, 22, 'こう');

INSERT INTO quizzes (id, type) VALUES (23, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (23, 23, '漢字の読み方を答えよ', '鮲');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (49, 23, 'こち');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (50, 23, 'まて');

INSERT INTO quizzes (id, type) VALUES (24, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (24, 24, '漢字の読み方を答えよ', '鮴');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (51, 24, 'ごり');

INSERT INTO quizzes (id, type) VALUES (25, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (25, 25, '漢字の読み方を答えよ', '鮨');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (52, 25, 'すし');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (53, 25, 'し');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (54, 25, 'げい');

INSERT INTO quizzes (id, type) VALUES (26, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (26, 26, '漢字の読み方を答えよ', '鮮');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (55, 26, 'あざ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (56, 26, 'せん');

INSERT INTO quizzes (id, type) VALUES (27, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (27, 27, '漢字の読み方を答えよ', '鯎');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (57, 27, 'うぐい');

INSERT INTO quizzes (id, type) VALUES (28, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (28, 28, '漢字の読み方を答えよ', '鯑');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (58, 28, 'かずのこ');

INSERT INTO quizzes (id, type) VALUES (29, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (29, 29, '漢字の読み方を答えよ', '鯒');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (59, 29, 'こち');

INSERT INTO quizzes (id, type) VALUES (30, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (30, 30, '漢字の読み方を答えよ', '鯀');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (60, 30, 'こん');

INSERT INTO quizzes (id, type) VALUES (31, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (31, 31, '漢字の読み方を答えよ', '鯊');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (61, 31, 'はぜ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (62, 31, 'さ');

INSERT INTO quizzes (id, type) VALUES (32, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (32, 32, '漢字の読み方を答えよ', '鮹');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (63, 32, 'たこ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (64, 32, 'しょう');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (65, 32, 'そう');

INSERT INTO quizzes (id, type) VALUES (33, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (33, 33, '漢字の読み方を答えよ', '鯐');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (66, 33, 'すばしり');

INSERT INTO quizzes (id, type) VALUES (34, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (34, 34, '漢字の読み方を答えよ', '鮸');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (67, 34, 'にべ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (68, 34, 'べん');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (69, 34, 'めん');

INSERT INTO quizzes (id, type) VALUES (35, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (35, 35, '漢字の読み方を答えよ', '鯉');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (70, 35, 'こい');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (71, 35, 'てがみ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (72, 35, 'り');

INSERT INTO quizzes (id, type) VALUES (36, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (36, 36, '漢字の読み方を答えよ', '鯣');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (73, 36, 'するめ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (74, 36, 'えき');

INSERT INTO quizzes (id, type) VALUES (37, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (37, 37, '漢字の読み方を答えよ', '鯨');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (75, 37, 'くじら');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (76, 37, 'げい');

INSERT INTO quizzes (id, type) VALUES (38, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (38, 38, '漢字の読み方を答えよ', '鯢');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (77, 38, 'さんしょううお');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (78, 38, 'めくじら');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (79, 38, 'げい');

INSERT INTO quizzes (id, type) VALUES (39, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (39, 39, '漢字の読み方を答えよ', '鯤');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (80, 39, 'こん');

INSERT INTO quizzes (id, type) VALUES (40, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (40, 40, '漢字の読み方を答えよ', '鯔');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (81, 40, 'ぼら');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (82, 40, 'いな');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (83, 40, 'し');

INSERT INTO quizzes (id, type) VALUES (41, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (41, 41, '漢字の読み方を答えよ', '鯱');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (84, 41, 'しゃち');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (85, 41, 'しゃちほこ');

INSERT INTO quizzes (id, type) VALUES (42, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (42, 42, '漢字の読み方を答えよ', '鯖');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (86, 42, 'さば');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (87, 42, 'よせなべ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (88, 42, 'せい');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (89, 42, 'しょう');

INSERT INTO quizzes (id, type) VALUES (43, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (43, 43, '漢字の読み方を答えよ', '鯛');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (90, 43, 'たい');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (91, 43, 'ちょう');

INSERT INTO quizzes (id, type) VALUES (44, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (44, 44, '漢字の読み方を答えよ', '鯰');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (92, 44, 'なまず');

INSERT INTO quizzes (id, type) VALUES (45, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (45, 45, '漢字の読み方を答えよ', '鰙');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (93, 45, 'はや');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (94, 45, 'はえ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (95, 45, 'わかさぎ');

INSERT INTO quizzes (id, type) VALUES (46, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (46, 46, '漢字の読み方を答えよ', '鯡');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (96, 46, 'にしん');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (97, 46, 'はららご');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (98, 46, 'はらご');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (99, 46, 'ひ');

INSERT INTO quizzes (id, type) VALUES (47, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (47, 47, '漢字の読み方を答えよ', '鰄');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (100, 47, 'かいらぎ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (101, 47, 'い');

INSERT INTO quizzes (id, type) VALUES (48, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (48, 48, '漢字の読み方を答えよ', '鰕');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (102, 48, 'えび');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (103, 48, 'か');

INSERT INTO quizzes (id, type) VALUES (49, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (49, 49, '漢字の読み方を答えよ', '鰐');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (104, 49, 'わに');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (105, 49, 'がく');

INSERT INTO quizzes (id, type) VALUES (50, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (50, 50, '漢字の読み方を答えよ', '鰔');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (106, 50, 'かれい');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (107, 50, 'かん');

INSERT INTO quizzes (id, type) VALUES (51, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (51, 51, '漢字の読み方を答えよ', '鰉');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (108, 51, 'ひがい');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (109, 51, 'こう');

INSERT INTO quizzes (id, type) VALUES (52, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (52, 52, '漢字の読み方を答えよ', '鰓');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (110, 52, 'えら');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (111, 52, 'あぎと');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (112, 52, 'さい');

INSERT INTO quizzes (id, type) VALUES (53, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (53, 53, '漢字の読み方を答えよ', '鰍');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (113, 53, 'いなだ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (114, 53, 'かじか');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (115, 53, 'どじょう');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (116, 53, 'しゅう');

INSERT INTO quizzes (id, type) VALUES (54, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (54, 54, '漢字の読み方を答えよ', '鰌');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (117, 54, 'どじょう');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (118, 54, 'しゅう');

INSERT INTO quizzes (id, type) VALUES (55, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (55, 55, '漢字の読み方を答えよ', '鰆');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (119, 55, 'さわら');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (120, 55, 'しゅん');

INSERT INTO quizzes (id, type) VALUES (56, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (56, 56, '漢字の読み方を答えよ', '鰈');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (121, 56, 'かれい');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (122, 56, 'ちょう');

INSERT INTO quizzes (id, type) VALUES (57, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (57, 57, '漢字の読み方を答えよ', '鰚');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (123, 57, 'はらか');

INSERT INTO quizzes (id, type) VALUES (58, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (58, 58, '漢字の読み方を答えよ', '鰒');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (124, 58, 'あわび');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (125, 58, 'ふぐ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (126, 58, 'ふく');

INSERT INTO quizzes (id, type) VALUES (59, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (59, 59, '漢字の読み方を答えよ', '鰘');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (127, 59, 'むろあじ');

INSERT INTO quizzes (id, type) VALUES (60, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (60, 60, '漢字の読み方を答えよ', '鰊');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (128, 60, 'にしん');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (129, 60, 'れん');

INSERT INTO quizzes (id, type) VALUES (61, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (61, 61, '漢字の読み方を答えよ', '鰰');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (130, 61, 'はたはた');

INSERT INTO quizzes (id, type) VALUES (62, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (62, 62, '漢字の読み方を答えよ', '鰯');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (131, 62, 'いわし');

INSERT INTO quizzes (id, type) VALUES (63, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (63, 63, '漢字の読み方を答えよ', '鰮');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (132, 63, 'いわし');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (133, 63, 'おん');

INSERT INTO quizzes (id, type) VALUES (64, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (64, 64, '漢字の読み方を答えよ', '鰥');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (134, 64, 'やもお');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (135, 64, 'やもめ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (136, 64, 'や');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (137, 64, 'かん');

INSERT INTO quizzes (id, type) VALUES (65, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (65, 65, '漢字の読み方を答えよ', '鰭');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (138, 65, 'ひれ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (139, 65, 'はた');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (140, 65, 'き');

INSERT INTO quizzes (id, type) VALUES (66, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (66, 66, '漢字の読み方を答えよ', '鰤');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (141, 66, 'ぶり');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (142, 66, 'し');

INSERT INTO quizzes (id, type) VALUES (67, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (67, 67, '漢字の読み方を答えよ', '鰧');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (143, 67, 'おこぜ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (144, 67, 'とう');

INSERT INTO quizzes (id, type) VALUES (68, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (68, 68, '漢字の読み方を答えよ', '鰹');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (145, 68, 'かつお');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (146, 68, 'けん');

INSERT INTO quizzes (id, type) VALUES (69, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (69, 69, '漢字の読み方を答えよ', '鱇');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (147, 69, 'こう');

INSERT INTO quizzes (id, type) VALUES (70, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (70, 70, '漢字の読み方を答えよ', '鱆');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (148, 70, 'たこ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (149, 70, 'しょう');

INSERT INTO quizzes (id, type) VALUES (71, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (71, 71, '漢字の読み方を答えよ', '鱈');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (150, 71, 'たら');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (151, 71, 'せつ');

INSERT INTO quizzes (id, type) VALUES (72, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (72, 72, '漢字の読み方を答えよ', '鰾');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (152, 72, 'ふえ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (153, 72, 'うきぶくろ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (154, 72, 'ひょう');

INSERT INTO quizzes (id, type) VALUES (73, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (73, 73, '漢字の読み方を答えよ', '鰻');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (155, 73, 'うなぎ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (156, 73, 'まん');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (157, 73, 'ばん');

INSERT INTO quizzes (id, type) VALUES (74, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (74, 74, '漢字の読み方を答えよ', '鱛');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (158, 74, 'えそ');

INSERT INTO quizzes (id, type) VALUES (75, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (75, 75, '漢字の読み方を答えよ', '鱚');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (159, 75, 'きす');

INSERT INTO quizzes (id, type) VALUES (76, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (76, 76, '漢字の読み方を答えよ', '鱏');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (160, 76, 'えい');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (161, 76, 'じん');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (162, 76, 'しん');

INSERT INTO quizzes (id, type) VALUES (77, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (77, 77, '漢字の読み方を答えよ', '鱓');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (163, 77, 'うつぼ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (164, 77, 'ごまめ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (165, 77, 'せん');

INSERT INTO quizzes (id, type) VALUES (78, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (78, 78, '漢字の読み方を答えよ', '鱒');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (166, 78, 'ます');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (167, 78, 'そん');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (168, 78, 'ぞん');

INSERT INTO quizzes (id, type) VALUES (79, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (79, 79, '漢字の読み方を答えよ', '鱠');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (169, 79, 'なます');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (170, 79, 'かい');

INSERT INTO quizzes (id, type) VALUES (80, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (80, 80, '漢字の読み方を答えよ', '鱟');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (171, 80, 'かぶとがに');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (172, 80, 'ごう');

INSERT INTO quizzes (id, type) VALUES (81, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (81, 81, '漢字の読み方を答えよ', '鱩');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (173, 81, 'はたはた');

INSERT INTO quizzes (id, type) VALUES (82, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (82, 82, '漢字の読み方を答えよ', '鱗');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (174, 82, 'うろこ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (175, 82, 'りん');

INSERT INTO quizzes (id, type) VALUES (83, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (83, 83, '漢字の読み方を答えよ', '鱧');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (176, 83, 'れい');

INSERT INTO quizzes (id, type) VALUES (84, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (84, 84, '漢字の読み方を答えよ', '鱲');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (177, 84, 'からすみ');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (178, 84, 'りょう');

INSERT INTO quizzes (id, type) VALUES (85, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (85, 85, '漢字の読み方を答えよ', '鱶');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (179, 85, 'ふか');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (180, 85, 'しょう');

INSERT INTO quizzes (id, type) VALUES (86, 1);
INSERT INTO quiz_questions (id, quiz_id, question, highlight) VALUES (86, 86, '漢字の読み方を答えよ', '鱸');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (181, 86, 'すずき');
INSERT INTO quiz_answers (id, quiz_id, answer) VALUES (182, 86, 'ろ');
