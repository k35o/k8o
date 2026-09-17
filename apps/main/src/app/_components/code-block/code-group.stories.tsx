import { expect, waitFor, within } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { CodeBlock } from './code-block';
import { CodeGroup } from './code-group';

// アプリではルートの layout が読み込むため、Storybook では Story 側で読み込む
import '@repo/code-highlight/styles.css';

// rehype が出力する形に合わせ、data-label を持つ div で pre を包む
const packageManagerBlocks = [
  { label: 'pnpm', command: 'pnpm add react@19.3.0 react-dom@19.3.0' },
  { label: 'npm', command: 'npm install react@19.3.0 react-dom@19.3.0' },
  { label: 'yarn', command: 'yarn add react@19.3.0 react-dom@19.3.0' },
].map(({ label, command }) => (
  <div className="code-annotate-block" data-label={label} key={label}>
    <CodeBlock className="shiki" data-lang="bash">
      <code>
        <span className="line">{command}</span>
      </code>
    </CodeBlock>
  </div>
));

const unlabeledBlocks = ['Hello', 'World'].map((text) => (
  <div className="code-annotate-block" key={text}>
    <CodeBlock className="shiki">
      <code>
        <span className="line">{text}</span>
      </code>
    </CodeBlock>
  </div>
));

// 選択は startTransition と ViewTransition を通して非同期にコミットされるため、反映を待つ
const expectSelectedTab = async (
  canvasElement: HTMLElement,
  name: string,
): Promise<void> => {
  await waitFor(async () => {
    await expect(
      within(canvasElement).getByRole('tab', { selected: true }),
    ).toHaveAccessibleName(name);
  });
};

const meta = preview.meta({
  title: 'app/globals/code-group',
  component: CodeGroup,
  args: {
    children: packageManagerBlocks,
  },
  decorators: [
    (Story) => (
      <div className="bg-bg-base p-4">
        <Story />
      </div>
    ),
  ],
});

export const Primary = meta.story({
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getAllByRole('tab').map((tab) => tab.textContent),
    ).toStrictEqual(['pnpm', 'npm', 'yarn']);
    await expect(
      canvas.getByRole('tab', { selected: true }),
    ).toHaveAccessibleName('pnpm');
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(
      'pnpm add react@19.3.0 react-dom@19.3.0',
    );
  },
});

export const SelectsTabOnClick = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'npm' }));

    await expectSelectedTab(canvasElement, 'npm');
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(
      'npm install react@19.3.0 react-dom@19.3.0',
    );
  },
});

export const WrapsAroundWithArrowKeys = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'pnpm' }));

    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('tab', { name: 'yarn' })).toHaveFocus();
    await expectSelectedTab(canvasElement, 'yarn');

    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'pnpm' })).toHaveFocus();
    await expectSelectedTab(canvasElement, 'pnpm');
  },
});

export const JumpsToEdgesWithHomeAndEnd = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'pnpm' }));

    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('tab', { name: 'yarn' })).toHaveFocus();
    await expectSelectedTab(canvasElement, 'yarn');

    await userEvent.keyboard('{Home}');
    await expect(canvas.getByRole('tab', { name: 'pnpm' })).toHaveFocus();
    await expectSelectedTab(canvasElement, 'pnpm');
  },
});

export const LeavesTabListWithTabKey = meta.story({
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'pnpm' }));

    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'コードをコピー' }),
    ).toHaveFocus();
  },
});

export const WithoutLabel = meta.story({
  args: {
    children: unlabeledBlocks,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getAllByRole('tab').map((tab) => tab.textContent),
    ).toStrictEqual(['code 1', 'code 2']);
  },
});
