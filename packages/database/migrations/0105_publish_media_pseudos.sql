-- 下書きのまま入れた記事を公開する。一覧の並びと記事の日付をそろえるため、作成日も公開の日にする
UPDATE blogs SET published = 1, created_at = '2026-11-27T00:00:00.000Z' WHERE slug = 'media-pseudos';
