import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { ToolFrame } from '../tool-frame';
import { StudioPlaceholder } from './studio-placeholder';

import styles from './studio-placeholder.stories.module.css';

// Storybook の型は navigation に segments を持たないが、実行時は segments からルーターの木を組み、
// ToolFrame の useSelectedLayoutSegment がそれを読む。型の注釈を付けない定数にして渡す
const uiNavigation = { pathname: '/', segments: [] };

const meta = preview.meta({
  component: StudioPlaceholder,
  decorators: [
    (Story) => (
      <div className={styles.frame}>
        <ToolFrame sidebar={null}>
          <Story />
        </ToolFrame>
      </div>
    ),
  ],
  parameters: {
    nextjs: { navigation: uiNavigation },
  },
});

export const Default = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 確かめ終えた新しいプロジェクトと同じ見た目で、骨組みを出さない
    await expect(canvas.getByText('新しいプロジェクト')).toBeInTheDocument();
    await expect(canvas.getByText('UI を生成しましょう')).toBeInTheDocument();
    await expect(canvas.getByText('ヒーローセクション')).toBeInTheDocument();
    await expect(
      canvas.getByText('生成すると、ここにライブプレビューが表示されます'),
    ).toBeInTheDocument();
    await expect(canvas.queryByLabelText('読み込み中')).not.toBeInTheDocument();
    // 確かめ終えるまでは、タブ・コピー・全画面・会話の欄を操作させない
    await expect(
      canvas.getByText('ヒーローセクション').closest('[inert]'),
    ).not.toBeNull();
    await expect(
      canvas
        .getByRole('button', { name: 'コードをコピー', hidden: true })
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
