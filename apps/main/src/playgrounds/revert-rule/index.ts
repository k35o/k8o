import type { PlaygroundSection } from '../types';
import { RevertRuleDemo } from './revert-rule-demo';

export const revertRuleSection: PlaygroundSection = {
  id: 'revert-rule',
  title: 'revert-rule',
  description:
    'プロパティの値を、今のスタイルルールがなかった場合の値に戻すCSSのキーワードです。',
  category: 'css',
  type: 'blog',
  slug: 'revert-rule',
  demos: [
    {
      component: RevertRuleDemo,
      title: 'キーワードを切り替えて戻り先を比べる',
      description:
        '同じレイヤーの前のルール、前のレイヤー、ブラウザの既定のスタイルのどこへ値が戻るかを、revert-rule・revert-layer・revertを切り替えて確認できます。',
    },
  ],
};
