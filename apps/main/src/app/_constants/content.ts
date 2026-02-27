type ContentItem = {
  title: string;
  description: string;
  link: string;
};

export const profile = {
  name: 'k8o',
  description:
    'WebフロントエンドとTypeScriptが好きで、Baselineを追いながらWeb標準の進化を楽しんでいます。デザインシステムの構築を通じて、デザインとフロントエンドの交差点を探っています。',
} as const;

export const forgeSection = {
  title: 'Forge',
  description: '考えたことや作ったものを形にして公開する場。',
} as const;

export const forgeItems = [
  {
    title: 'Blog',
    description: 'Webフロントエンドの話題を中心に、日々のことも書くブログ。',
    link: '/blog',
  },
  {
    title: 'Talks',
    description:
      '過去の登壇内容をまとめたページです。講演のテーマや資料へのリンクを掲載しています。',
    link: '/talks',
  },
  {
    title: 'Playgrounds',
    description: 'ブログの記事や興味のある技術を試した試作品を集めた場所。',
    link: '/playgrounds',
  },
  {
    title: 'ArteOdyssey',
    description:
      'k8o.meで利用しているデザインシステムを紹介します。コンポーネントやデザイントークンを確認できます。',
    link: 'https://arte-odyssey.k8o.me',
  },
] as const satisfies readonly ContentItem[];

export const assistSection = {
  title: 'Assist',
  description: '日々の作業や日常で役立つちょっとしたツール群。',
} as const;

export const assistItems = [
  {
    title: 'もじカウント',
    description: 'テキストの文字数をリアルタイムに数えます。',
    link: '/moji-count',
  },
  {
    title: '日本語校正くん',
    description: '日本語の文章を解析し、誤字脱字や文法ミスを指摘します。',
    link: '/japanese-text-fixer',
  },
  {
    title: 'QRキット',
    description: 'テキストやURLからQRコードを生成してダウンロードできます。',
    link: '/qr-generator',
  },
  {
    title: '基数チェンジャー',
    description: '2進数・8進数・10進数・16進数を相互に変換します。',
    link: '/base-converter',
  },
  {
    title: 'コントラストチェッカー',
    description: '2色のコントラスト比を計算し、WCAGの基準で評価します。',
    link: '/contrast-checker',
  },
  {
    title: 'カラーコード職人',
    description: 'HEX・RGB・HSLの色表現を相互に変換します。',
    link: '/color-converter',
  },
  {
    title: 'かどまるラボ',
    description: 'border-radiusを視覚的に操作してCSSを生成します。',
    link: '/radius-maker',
  },
  {
    title: 'SQLテーブルメーカー',
    description:
      'テーブル名・カラム・制約を入力してCREATE TABLE文を生成します。',
    link: '/sql-table-builder',
  },
  {
    title: 'Quizzes',
    description: 'いろいろなジャンルの知識をクイズで試せます。',
    link: '/quizzes',
  },
  {
    title: 'テキスト差分チェッカー',
    description: '2つのテキストを文字単位で比較して差分を表示します。',
    link: '/text-diff',
  },
] as const satisfies readonly ContentItem[];
