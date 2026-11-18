-- talks の id はマイグレーションの外でも採番されるので、イベントの URL で引く
UPDATE talks SET slug = 'tskaigi-2025' WHERE event_url = 'https://2025.tskaigi.org/talks/k35o';
