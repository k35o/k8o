import { expect, within } from 'storybook/test';

import preview from '../../../../../../.storybook/preview';
import { ToolFrame } from '../../../_components/tool-frame';
import { SlidesPlaceholder } from './slides-placeholder';

// Storybook の型は navigation に segments を持たないが、実行時は segments からルーターの木を組み、
// ToolFrame の useSelectedLayoutSegment がそれを読む。型の注釈を付けない定数にして渡す
const slidesNavigation = { pathname: '/slides', segments: ['slides'] };

const meta = preview.meta({
  component: SlidesPlaceholder,
  decorators: [
    (Story) => (
      <div className="bg-bg-surface flex h-160 flex-col">
        <ToolFrame sidebar={null}>
          <Story />
        </ToolFrame>
      </div>
    ),
  ],
  parameters: {
    nextjs: { navigation: slidesNavigation },
  },
});

export const Default = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 確かめ終えた新しいスライドと同じ見た目で、骨組みを出さない
    await expect(canvas.getByText('新しいスライド')).toBeInTheDocument();
    await expect(
      canvas.getByText('スライドを生成しましょう'),
    ).toBeInTheDocument();
    await expect(canvas.getByText('自己紹介の5枚デッキ')).toBeInTheDocument();
    await expect(
      canvas.getByText('生成すると、ここにスライドのプレビューが表示されます'),
    ).toBeInTheDocument();
    await expect(canvas.queryByLabelText('読み込み中')).not.toBeInTheDocument();
    // 確かめ終えるまでは、タブ・PDF出力・コピー・全画面・会話の欄を操作させない
    await expect(
      canvas.getByText('自己紹介の5枚デッキ').closest('[inert]'),
    ).not.toBeNull();
    await expect(
      canvas
        .getByRole('button', { name: 'PDF出力', hidden: true })
        .closest('[inert]'),
    ).not.toBeNull();
    // 枠の Drawer を開くメニューは、確かめるあいだも開ける
    await expect(
      canvas
        .getByRole('button', { name: 'メニューを開く', hidden: true })
        .closest('[inert]'),
    ).toBeNull();
  },
});
