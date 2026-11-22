-- 定期実行は発表の時刻どおりに走らないので deck_published_at は入れず、このマイグレーションのマージを公開の合図にする
UPDATE talks SET slug = 'jsconf-jp-2026' WHERE event_url = 'https://jsconf.jp/2026/ja/talks/dwango-sponsor-session';
