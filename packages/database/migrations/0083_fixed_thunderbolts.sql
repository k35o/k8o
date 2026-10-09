-- 保存済みの要約のうち作り直すべきものを未要約に戻し、api の同期に Claude で
-- 作り直させる。閲覧時に Sakana Fugu で作っていた頃は、抽出が先頭8000字を切る
-- だけだったため、blog.cloudflare.com や github.blog ではナビゲーションやタグ一覧
-- しか渡らず、「本文が無い」という応答や、タイトルだけから作った要約が保存されて
-- いた（github.blog は文面で見分けられないので URL で拾う）。
-- 同期は直近90日の記事しか要約しないので、それより古い記事には手を付けない。
-- 生の SQL では drizzle の $onUpdate が効かないので updated_at も自分で書く
UPDATE `articles`
SET `summary` = NULL,
  `summary_attempts` = 0,
  `updated_at` = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE `summary` IS NOT NULL
  AND `published_at` >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-90 days')
  AND (
    `summary` LIKE '%提示された%'
    OR `summary` LIKE '%提供されたテキスト%'
    OR `summary` LIKE '%提供された文章%'
    OR `summary` LIKE '%提供された本文%'
    OR `summary` LIKE '%記事本文%'
    OR `summary` LIKE '%記事の本文%'
    OR `summary` LIKE '%本文は含まれ%'
    OR `summary` LIKE '%本文が含まれ%'
    OR `summary` LIKE '%掲載本文%'
    OR `summary` LIKE '%サイト共通%'
    OR `summary` LIKE '%タグ一覧%'
    OR `summary` LIKE '%要約でき%'
    OR `summary` LIKE '%要約することはでき%'
    OR substr(`summary`, -1) <> '。'
    OR length(`summary`) < 100
    OR instr(`summary`, char(10)) > 0
    OR `summary` LIKE '%&lt;%'
    OR `summary` LIKE '%&gt;%'
    OR `summary` LIKE '%&amp;%'
    OR `summary` LIKE '%&quot;%'
    OR `summary` LIKE '%&#%'
    OR `url` LIKE 'https://github.blog/%'
  );
--> statement-breakpoint
-- Fugu の失敗で試行回数を使った未要約の記事も、Claude で改めて試させる
UPDATE `articles`
SET `summary_attempts` = 0,
  `updated_at` = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE `summary` IS NULL
  AND `summary_attempts` > 0
  AND `published_at` >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-90 days');
