import { expect, within } from 'storybook/test';

import preview from '../../../../../../.storybook/preview';
import { ToolFrame } from '../../../_components/tool-frame';
import { NewChatPlaceholder } from './new-chat-placeholder';

import styles from './new-chat-placeholder.stories.module.css';

// Storybook の型は navigation に segments を持たないが、実行時は segments からルーターの木を組み、
// ToolFrame の useSelectedLayoutSegment がそれを読む。型の注釈を付けない定数にして渡す
const chatNavigation = { pathname: '/chat', segments: ['chat'] };

const meta = preview.meta({
  component: NewChatPlaceholder,
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
    nextjs: { navigation: chatNavigation },
  },
});

export const Default = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 確かめ終えた新しい会話と同じ見た目で、骨組みを出さない
    await expect(
      canvas.getByRole('heading', { name: '新しいチャット' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('k8o のブログについて聞く'),
    ).toBeInTheDocument();
    await expect(canvas.queryByLabelText('読み込み中')).not.toBeInTheDocument();
    // 確かめ終えるまでは、会話の欄を操作させない
    await expect(
      canvas.getByText('k8o のブログについて聞く').closest('[inert]'),
    ).not.toBeNull();
  },
});
