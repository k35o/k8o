import type { Route } from 'next';

// 「使う」もの（ツール）か「読む・眺める」もの（読みもの）かの種類。
export type SiteEntryKind = 'tool' | 'reading';

// カードに表示するアイコンの種類。実体（コンポーネント）への対応は UI 層で持つ。
export type SiteEntryIcon =
  | 'baseline'
  | 'colorConverter'
  | 'contrastChecker'
  | 'colorQuiz'
  | 'radiusMaker'
  | 'mojiCount'
  | 'fluida'
  | 'blog'
  | 'talks'
  | 'playgrounds'
  | 'artifacts'
  | 'readings';

export type SiteEntry = {
  title: string;
  link: Route | `https://${string}`;
  description: string;
  kind: SiteEntryKind;
  icon: SiteEntryIcon;
};

// 種類ごとのセクション見出し。
export const KIND_SECTION: Record<
  SiteEntryKind,
  { title: string; description: string }
> = {
  tool: {
    title: 'Tools',
    description: '日々の作業や遊びに使う、ちょっとした道具。',
  },
  reading: {
    title: 'Reading',
    description: '読んだり眺めたりする、書きもの・集めもの。',
  },
};

// 並び順は種類から導出する（読みもの → ツール）。
// そのため下の記述順が意味を持つのは「種類内の並び」だけ。
const KIND_ORDER: Record<SiteEntryKind, number> = {
  reading: 0,
  tool: 1,
};

const entries: readonly SiteEntry[] = [
  {
    title: 'Baseline',
    link: '/baseline',
    description: 'Web Platform Baselineのステータスを追跡します。',
    kind: 'tool',
    icon: 'baseline',
  },
  {
    title: 'カラーコード職人',
    link: '/color-converter',
    description: 'HEX・RGB・HSL・OKLCHなどCSSの色形式を相互に変換します。',
    kind: 'tool',
    icon: 'colorConverter',
  },
  {
    title: 'コントラストチェッカー',
    link: '/contrast-checker',
    description:
      '2色のコントラスト比とAPCAのLc値を計算し、WCAGの基準で評価します。',
    kind: 'tool',
    icon: 'contrastChecker',
  },
  {
    title: 'カラーHexクイズ',
    link: '/color-quiz',
    description: '色からHexコードを当てたり、Hexコードから色を選ぶクイズです。',
    kind: 'tool',
    icon: 'colorQuiz',
  },
  {
    title: 'かどまるラボ',
    link: '/radius-maker',
    description: 'border-radiusを視覚的に操作してCSSを生成します。',
    kind: 'tool',
    icon: 'radiusMaker',
  },
  {
    title: 'もじカウント',
    link: '/moji-count',
    description: 'テキストの文字数をリアルタイムに数えます。',
    kind: 'tool',
    icon: 'mojiCount',
  },
  {
    title: 'fluida',
    link: 'https://fluida.k8o.me',
    description:
      '絵の具を流して模様を描く、フルイドアートのお絵かきWebアプリです。',
    kind: 'tool',
    icon: 'fluida',
  },
  {
    title: 'Blog',
    link: '/blog',
    description: 'Webフロントエンドを中心に、日々のことも書いています。',
    kind: 'reading',
    icon: 'blog',
  },
  {
    title: 'Talks',
    link: '/talks',
    description: '過去の登壇テーマや資料へのリンクをまとめています。',
    kind: 'reading',
    icon: 'talks',
  },
  {
    title: 'Playgrounds',
    link: '/playgrounds',
    description: 'ブログ記事や興味のある技術の試作品を集めています。',
    kind: 'reading',
    icon: 'playgrounds',
  },
  {
    title: 'Artifacts',
    link: '/artifacts',
    description: 'dotfilesやskills、自作ツールなどの制作物をまとめています。',
    kind: 'reading',
    icon: 'artifacts',
  },
  {
    title: 'Readings',
    link: '/reading-list',
    description: '気になっている記事を集めて、あとから探せるようにしています。',
    kind: 'reading',
    icon: 'readings',
  },
];

// 種類順に整列。種類内は記述順を保つ（安定ソート）。
export const siteEntries: readonly SiteEntry[] = [...entries].toSorted(
  (a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind],
);
