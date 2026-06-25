import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { StreamPreview } from './stream-preview';

// 生成プロンプトのお手本に倣った宣言的サンプル（完成形）。
const SAMPLE_RICH = `import { Card, Heading, Stack, Button, Badge, Separator } from '@k8o/arte-odyssey';

export default function Preview() {
  return (
    <div className="bg-bg-surface flex min-h-screen items-center justify-center p-8">
      <Card appearance="shadow">
        <div className="flex flex-col gap-6 p-8">
          <div className="flex items-center gap-3">
            <Heading type="h2">プラン</Heading>
            <Badge text="人気" tone="info" />
          </div>
          <p className="text-fg-mute text-sm leading-relaxed">月額プランのご案内です。</p>
          <Separator orientation="horizontal" />
          <Button color="primary" variant="solid" startIcon={<SparklesIcon />}>申し込む</Button>
        </div>
      </Card>
    </div>
  );
}`;

// サブセット外（Tabs / .map / FormControl の renderInput）を含むサンプル。
const SAMPLE_HARD = `import { Tabs, FormControl, TextField, Button } from '@k8o/arte-odyssey';

export default function Preview() {
  const items = ['A', 'B'];
  return (
    <div className="flex flex-col gap-6 p-8">
      <Tabs>...</Tabs>
      <ul className="flex flex-col gap-2">{items.map((i) => <li key={i}>{i}</li>)}</ul>
      <FormControl label="お名前" renderInput={(props) => <TextField {...props} />} />
      <Button color="primary" variant="solid">送信</Button>
    </div>
  );
}`;

const meta = {
  component: StreamPreview,
} satisfies Meta<typeof StreamPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

// 完成形。アイコン付きボタンまで含めて素直に描けることを確認する。
export const Complete: Story = {
  args: { code: SAMPLE_RICH },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('申し込む')).toBeInTheDocument();
    await expect(canvas.getByText('プラン')).toBeInTheDocument();
  },
};

// 生成 4 割時点。受信済みまで描き、先端にスケルトンが出る。
export const StreamingEarly: Story = {
  args: { code: SAMPLE_RICH.slice(0, Math.floor(SAMPLE_RICH.length * 0.4)) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('status').length).toBeGreaterThan(0);
  },
};

// 生成 7 割時点。骨格が出揃い、末尾だけ未受信。
export const StreamingLate: Story = {
  args: { code: SAMPLE_RICH.slice(0, Math.floor(SAMPLE_RICH.length * 0.7)) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('プラン')).toBeInTheDocument();
    await expect(canvas.getAllByRole('status').length).toBeGreaterThan(0);
  },
};

// サブセット外がどこに出るかを可視化（UnknownChip）。Button は素直に描ける。
export const UnsupportedSubset: Story = {
  args: { code: SAMPLE_HARD },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('送信')).toBeInTheDocument();
    await expect(canvas.getByText('<Tabs>')).toBeInTheDocument();
  },
};

// 生成開始直後（return 未到達＝まだ構造なし）。スケルトンではなくスピナーを出す。
export const Empty: Story = {
  args: {
    code: "import { Card } from '@k8o/arte-odyssey';\n\nexport default function Preview() {",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toBeInTheDocument();
  },
};
