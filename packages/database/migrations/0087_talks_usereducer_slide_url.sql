-- talks の id はマイグレーションの外でも採番されるので、イベントの URL で引く
UPDATE talks SET slide_url = 'https://speakerdeck.com/k35o/react19tebian-hua-sitausereducernoxing-karaxue-hutypescriptnoxing-tui-lun' WHERE event_url = 'https://2025.tskaigi.org/talks/k35o';
