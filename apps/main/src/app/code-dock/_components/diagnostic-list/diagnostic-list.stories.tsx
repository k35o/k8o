import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import type { LintDiagnostic } from '@/features/code-dock/interface/types';

import { DiagnosticList } from './diagnostic-list';

const sampleDiagnostics: LintDiagnostic[] = [
  {
    code: 'eslint(no-var)',
    column: 1,
    help: 'Replace var with let or const',
    line: 1,
    message: 'Unexpected var, use let or const instead.',
    severity: 'error',
    url: 'https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-var.html',
  },
  {
    code: 'eslint(no-console)',
    column: 3,
    help: null,
    line: 4,
    message: 'Unexpected console statement.',
    severity: 'warning',
    url: 'https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-console.html',
  },
  {
    code: null,
    column: null,
    help: null,
    line: null,
    message: 'Unexpected token',
    severity: 'error',
    url: null,
  },
];

const meta: Meta<typeof DiagnosticList> = {
  title: 'app/code-dock/diagnostic-list',
  component: DiagnosticList,
  args: {
    diagnostics: sampleDiagnostics,
    errorMessage: null,
    isLinting: false,
  },
};

export default meta;
type Story = StoryObj<typeof DiagnosticList>;

// 正常系: 診断が severity バッジ・位置・ルールコードつきで一覧表示される
export const Primary: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Unexpected var, use let or const instead.'),
    ).toBeInTheDocument();
    await expect(canvas.getByText('L1:1')).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', { name: 'eslint(no-var)' }),
    ).toBeInTheDocument();
    await expect(canvas.getByText('error 2 / warning 1')).toBeInTheDocument();
  },
};

// 正常系: 診断 0 件は成功の Alert になる
export const NoIssues: Story = {
  args: {
    diagnostics: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('問題は見つかりませんでした'),
    ).toBeInTheDocument();
  },
};

// 正常系: 未検査 (コードが空) は案内文を表示する
export const NotChecked: Story = {
  args: {
    diagnostics: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('コードを入力すると、自動で検査結果が表示されます。'),
    ).toBeInTheDocument();
  },
};

// 正常系: 検査中はスピナーを表示する
export const Linting: Story = {
  args: {
    isLinting: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('検査中')).toBeInTheDocument();
  },
};

// 異常系: 検査自体の失敗はエラーの Alert になる
export const LintFailed: Story = {
  args: {
    errorMessage: 'コードの検査に失敗しました',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('コードの検査に失敗しました'),
    ).toBeInTheDocument();
  },
};
