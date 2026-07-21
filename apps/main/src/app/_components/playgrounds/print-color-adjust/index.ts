import type { PlaygroundSection } from '../types';
import { PrintColorAdjustDemo } from './print-color-adjust-demo';

export const printColorAdjustSection: PlaygroundSection = {
  id: 'print-color-adjust',
  title: 'CSS print-color-adjust',
  description: '印刷時の色の調整を制御するCSSプロパティです。',
  category: 'css',
  type: 'blog',
  slug: 'print-color-adjust',
  demos: [
    {
      component: PrintColorAdjustDemo,
      title: '印刷時の色調整デモ',
      description:
        'ボタンでexactとeconomyを切り替え、印刷プレビューで背景色が保持されるか比べられます。',
    },
  ],
};
