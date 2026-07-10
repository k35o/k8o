import type { HighlightTheme } from '@repo/code-highlight/tokenize';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import type { FC } from 'react';
import { expect, waitFor, within } from 'storybook/test';

import type { LintLanguage } from '@/features/code-dock/interface/types';

import { CodeEditor } from './code-editor';

const ControlledEditor: FC<{
  initialValue: string;
  language: LintLanguage;
  theme: HighlightTheme;
}> = ({ initialValue, language, theme }) => {
  const [value, setValue] = useState(initialValue);
  return (
    <CodeEditor
      language={language}
      onChange={setValue}
      theme={theme}
      value={value}
    />
  );
};

const meta: Meta<typeof ControlledEditor> = {
  title: 'app/code-dock/code-editor',
  component: ControlledEditor,
  args: {
    initialValue: "const greeting = 'Hello, k8o!';\n",
    language: 'tsx',
    theme: 'plastic',
  },
};

export default meta;
type Story = StoryObj<typeof ControlledEditor>;

// 正常系: shiki のトークンで色つき表示される (実ブラウザでハイライトが動く)
export const Primary: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('textbox', { name: 'コード' }),
    ).toBeInTheDocument();
    await waitFor(
      () => {
        const coloredTokens = canvasElement.querySelectorAll(
          'pre code span[style*="color"]',
        );
        expect(coloredTokens.length).toBeGreaterThan(0);
      },
      { timeout: 10_000 },
    );
  },
};

// 正常系: ライトテーマ (one-light) では明るい面色でハイライトされる
export const OneLight: Story = {
  args: {
    theme: 'one-light',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('textbox', { name: 'コード' }),
    ).toBeInTheDocument();
    await waitFor(
      () => {
        const coloredTokens = canvasElement.querySelectorAll(
          'pre code span[style*="color"]',
        );
        expect(coloredTokens.length).toBeGreaterThan(0);
      },
      { timeout: 10_000 },
    );
  },
};

// 正常系: 入力すると textarea の値と表示テキストが同期する
export const Typing: Story = {
  args: {
    initialValue: '',
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'コード' });

    await userEvent.type(textarea, 'const answer = 42;');

    await expect(textarea).toHaveValue('const answer = 42;');
    const pre = canvasElement.querySelector('pre');
    await waitFor(() => {
      expect(pre?.textContent).toContain('const answer = 42;');
    });
  },
};
