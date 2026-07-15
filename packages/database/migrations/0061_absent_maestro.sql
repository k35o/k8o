-- AI Gateway 無料枠のレート制限で summary_attempts だけ消費し、あきらめ状態に
-- なった未要約記事を救済する。生成は Sakana Fugu へ移行済みのため、再試行の
-- 予算をリセットして次回表示時に改めて生成させる
UPDATE `articles` SET `summary_attempts` = 0 WHERE `summary` IS NULL AND `summary_attempts` > 0;
