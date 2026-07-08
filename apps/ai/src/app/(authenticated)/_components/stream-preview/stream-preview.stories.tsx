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

// サブセット外（Tabs / .map / FormControl の renderInput / 未登録アイコン）を含むサンプル。
const SAMPLE_HARD = `import { Tabs, FormControl, TextField, Button, IconButton, PaletteIcon } from '@k8o/arte-odyssey';

export default function Preview() {
  const items = ['A', 'B'];
  return (
    <div className="flex flex-col gap-6 p-8">
      <Tabs>...</Tabs>
      <ul className="flex flex-col gap-2">{items.map((i) => <li key={i}>{i}</li>)}</ul>
      <FormControl label="お名前" renderInput={(props) => <TextField {...props} />} />
      <IconButton label="パレット" color="base" size="sm"><PaletteIcon /></IconButton>
      <Button color="primary" variant="solid">送信</Button>
    </div>
  );
}`;

// インラインデータ + .map() で複製するグリッド（実際の生成でよく出るパターン）。
const SAMPLE_GRID = `import { Grid, Card, Avatar, Heading, Badge, IconButton, GitHubIcon, MailIcon } from '@k8o/arte-odyssey';

const members = [
  { name: '田中 太郎', role: 'フロントエンド', initials: 'TT' },
  { name: '佐藤 花子', role: 'UIデザイナー', initials: 'SH' },
  { name: '鈴木 一郎', role: 'バックエンド', initials: 'SI' },
];

export default function Preview() {
  return (
    <div className="bg-bg-surface p-8">
      <Grid cols={3} gap="md">
        {members.map((m) => (
          <Card appearance="shadow">
            <div className="flex flex-col items-center gap-3 p-6">
              <Avatar fallback={m.initials} size="lg" />
              <Heading type="h3">{m.name}</Heading>
              <Badge text={m.role} tone="info" />
              <div className="flex gap-2">
                <IconButton label="GitHub" color="base" size="sm"><GitHubIcon size="sm" /></IconButton>
                <IconButton label="メール" color="base" size="sm"><MailIcon size="sm" /></IconButton>
              </div>
            </div>
          </Card>
        ))}
      </Grid>
    </div>
  );
}`;

// 文字列連結式（`'…' + x + '…'`）を含むサンプル。連結式は単一リテラルではないため
// 値として描かず、生のコード片が画面に漏れないことを確認する。
const SAMPLE_CONCAT = `import { Card, Heading } from '@k8o/arte-odyssey';

export default function Preview() {
  const name = 'k8o';
  return (
    <div className="bg-bg-surface p-8">
      <Card appearance="shadow">
        <div className="flex flex-col gap-4 p-8">
          <Heading type="h2">ようこそ</Heading>
          <p className="text-fg-mute text-sm leading-relaxed">{'こんにちは、' + name + ' さん'}</p>
        </div>
      </Card>
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

// サブセット外はコンポーネント名を画面に出さず、匿名プレースホルダとして描く。
// 子を持つもの（Tabs）は子を透過描画し、葉（FormControl / 未登録アイコン）は無地ブロックになる。
export const UnsupportedSubset: Story = {
  args: { code: SAMPLE_HARD },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('送信')).toBeInTheDocument();
    // コンポーネント名が生テキストとして画面に漏れない（回帰防止）。
    await expect(canvasElement.textContent).not.toContain('<Tabs>');
    await expect(canvasElement.textContent).not.toContain('FormControl');
    await expect(canvasElement.textContent).not.toContain('PaletteIcon');
    // 葉のサブセット外はプレースホルダとして場所だけ確保される。
    await expect(
      canvasElement.querySelectorAll('[data-testid="unknown-placeholder"]')
        .length,
    ).toBeGreaterThan(0);
  },
};

// .map() でデータ配列からカードを複製（完成形）。3枚が並ぶ。
export const MapGridComplete: Story = {
  args: { code: SAMPLE_GRID },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('田中 太郎')).toBeInTheDocument();
    await expect(canvas.getByText('鈴木 一郎')).toBeInTheDocument();
  },
};

// .map() のテンプレートが途中。データ件数ぶんの部分カードが並び、先端にスケルトン。
export const MapGridStreaming: Story = {
  args: { code: SAMPLE_GRID.slice(0, Math.floor(SAMPLE_GRID.length * 0.78)) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('status').length).toBeGreaterThan(0);
  },
};

// 文字列連結式は値として描かず、生のコード片（`' + name + '`）が画面に漏れない。
// 連結式を含む <p> は空になるが、周囲の本文（見出し）は通常どおり描ける。
export const ConcatExpression: Story = {
  args: { code: SAMPLE_CONCAT },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('ようこそ')).toBeInTheDocument();
    // 生のコード片がそのままテキストとして出ていないこと（漏れの回帰防止）。
    await expect(canvasElement.textContent).not.toContain('+ name');
    await expect(canvasElement.textContent).not.toContain("' +");
    await expect(canvasElement.textContent).not.toContain('こんにちは、');
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
