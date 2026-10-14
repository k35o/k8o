import { defineLocales } from '@k8ordo/i18n';

// 呼び出しが集合の登録になる。@k8ordo/ui の組み込み文言はこの集合のロケールで描かれ、
// 集合が無い環境では英語になるので、サーバーの描画（app/layout.tsx・global-error.tsx）と
// ブラウザ（_providers/app.tsx）の両方で読み込む
defineLocales({ ja: { timeZone: 'Asia/Tokyo', dir: 'ltr' } });
