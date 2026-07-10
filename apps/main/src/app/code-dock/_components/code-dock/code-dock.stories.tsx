import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, waitFor, within } from 'storybook/test';

import type { LintDiagnostic } from '@/features/code-dock/interface/types';

import { CodeDock } from './code-dock';
import type { FormatAction, LintAction } from './code-dock';

const sampleDiagnostic: LintDiagnostic = {
  code: 'eslint(no-console)',
  column: 3,
  help: null,
  line: 4,
  message: 'Unexpected console statement.',
  severity: 'warning',
  url: 'https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-console.html',
};

// Storybook からはネイティブバイナリを動かせないため、server action の代わりに
// 固定の結果を返すフェイクを注入する
const fakeLint: LintAction = (code) =>
  Promise.resolve(
    code.includes('console.log')
      ? { diagnostics: [sampleDiagnostic] }
      : { diagnostics: [] },
  );

const FORMATTED_CODE = "const greeting = 'Hello, k8o!';\n";

const fakeFormat: FormatAction = () =>
  Promise.resolve({ code: FORMATTED_CODE });

const failingFormat: FormatAction = () =>
  Promise.resolve({ error: '整形できませんでした: Unexpected token' });

const meta: Meta<typeof CodeDock> = {
  title: 'app/code-dock/code-dock',
  component: CodeDock,
  args: {
    formatAction: fakeFormat,
    lintAction: fakeLint,
  },
};

export default meta;
type Story = StoryObj<typeof CodeDock>;

// 正常系: 初期サンプルがデバウンス後に自動で検査される
export const Primary: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('textbox', { name: 'コード' }),
    ).toBeInTheDocument();
    await waitFor(
      () => {
        expect(
          canvas.getByText('Unexpected console statement.'),
        ).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  },
};

// 正常系: コピーボタンが表示・クリックできる (クリップボードはブラウザ依存)
export const Copy: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'コピー' });
    await expect(button).toBeEnabled();
    await userEvent.click(button);
    await expect(button).toBeInTheDocument();
  },
};

// 正常系: 整形ボタンでエディタの内容が整形結果に置き換わり、再検査される
export const Format: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'コードを整形' });

    await userEvent.click(button);

    const textarea = canvas.getByRole('textbox', { name: 'コード' });
    await waitFor(() => {
      expect(textarea).toHaveValue(FORMATTED_CODE);
    });
    await waitFor(
      () => {
        expect(
          canvas.getByText('問題は見つかりませんでした'),
        ).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  },
};

// 異常系: 整形の失敗は Alert で通知される
export const FormatFailed: Story = {
  args: {
    formatAction: failingFormat,
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'コードを整形' });

    await userEvent.click(button);

    await waitFor(() => {
      expect(
        canvas.getByText('整形できませんでした: Unexpected token'),
      ).toBeInTheDocument();
    });
  },
};

// 正常系: 言語を切り替えられる
export const SwitchLanguage: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', { name: '言語' });

    await userEvent.selectOptions(select, 'ts');

    await expect(select).toHaveValue('ts');
  },
};
