import type { PlaygroundSection } from '../types';
import { MutedAttributeDemo } from './muted-attribute-demo';
import { PlaybackStateDemo } from './playback-state-demo';

export const mediaPseudosSection: PlaygroundSection = {
  id: 'media-pseudos',
  title: ':playing / :paused / :muted',
  description:
    'audioとvideoの再生状態にマッチするCSS疑似クラスです。:has()と組み合わせると、再生中かどうかをJavaScriptでクラスに写さなくてもプレイヤーUI全体を状態に追従させられます。',
  category: 'css',
  type: 'blog',
  slug: 'media-pseudos',
  demos: [
    {
      component: PlaybackStateDemo,
      title: ':playingで再生中のUIを動かす',
      description:
        '再生中だけバーのアニメーションが動き、マッチしている疑似クラスのチップが点灯します。ネイティブのコントロールとplay()呼び出しのどちらで操作しても同じように追従します。',
    },
    {
      component: MutedAttributeDemo,
      title: ':mutedとmuted属性のずれ',
      description:
        'muted属性の有無と:mutedのマッチを並べています。コントロールやプロパティでミュートを切り替えると:mutedだけが変わり、属性を付け外ししても音の状態は変わりません。',
    },
  ],
};
