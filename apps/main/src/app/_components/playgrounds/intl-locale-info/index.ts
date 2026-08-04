import type { PlaygroundSection } from '../types';
import { IntlLocaleInfoDemo } from './intl-locale-info-demo';

export const intlLocaleInfoSection: PlaygroundSection = {
  id: 'intl-locale-info',
  title: 'Intl.Locale info',
  description:
    'Intl.Localeのメソッドで、週の形や書字方向、暦などロケール固有の情報を取得できます。',
  category: 'js-api',
  type: 'blog',
  slug: 'intl-locale-info',
  demos: [
    {
      component: IntlLocaleInfoDemo,
      title: 'ロケールごとの返り値を確認する',
      description:
        'ロケール識別子を入力すると、7つのメソッドが返す値を一覧できます。プリセットのボタンでロケールを切り替えられます。',
    },
  ],
};
