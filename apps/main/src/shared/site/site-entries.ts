import type { Route } from 'next';

export type SiteEntryKind = 'tool' | 'reading';

export type SiteEntryIcon =
  | 'browserSupport'
  | 'colorConverter'
  | 'contrastChecker'
  | 'colorQuiz'
  | 'radiusMaker'
  | 'paletteMaker'
  | 'mojiCount'
  | 'htmlNest'
  | 'codeDock'
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

export const KIND_SECTION: Record<
  SiteEntryKind,
  { title: string; description: string }
> = {
  tool: {
    title: 'Tools',
    description: '日々の作業や遊びに使う、ちょっとした道具。',
  },
  reading: {
    title: 'Explore',
    description: '読んだり眺めたりする、書きもの・集めもの。',
  },
};

const KIND_ORDER: Record<SiteEntryKind, number> = {
  reading: 0,
  tool: 1,
};

const entries: readonly SiteEntry[] = [
  {
    title: 'Browser Support',
    link: '/browser-support',
    description: 'Webプラットフォーム機能のブラウザ対応状況を追跡します。',
    kind: 'tool',
    icon: 'browserSupport',
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
    title: 'いろばしご',
    link: '/palette-maker',
    description:
      'OKLCHの明度スケールで11段階のカラーパレットを生成し、コントラストを検証します。',
    kind: 'tool',
    icon: 'paletteMaker',
  },
  {
    title: 'もじカウント',
    link: '/moji-count',
    description: 'テキストの文字数をリアルタイムに数えます。',
    kind: 'tool',
    icon: 'mojiCount',
  },
  {
    title: 'HTMLいれ子マップ',
    link: '/html-nest',
    description:
      'HTMLタグを選ぶと、親に置ける要素と中に入れられる子要素が浮かび上がります。',
    kind: 'tool',
    icon: 'htmlNest',
  },
  {
    title: 'コードドック',
    link: '/code-dock',
    description:
      'JavaScript/TypeScriptのコードをoxlintで検査し、oxfmtで整形します。',
    kind: 'tool',
    icon: 'codeDock',
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

export const siteEntries: readonly SiteEntry[] = [...entries].toSorted(
  (a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind],
);
