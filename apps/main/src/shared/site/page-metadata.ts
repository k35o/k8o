type LlmMetadata = {
  title: string;
  description: string;
};

export const pageMetadata = {
  artifacts: {
    title: 'Artifacts',
    description: 'dotfilesや自作ツールなどの制作物をまとめています。',
  },
  baseline: {
    title: 'Baseline',
    description: 'Web Platform Baselineのステータスを追跡します。',
  },
  blog: {
    title: 'Blog',
    description: 'Webフロントエンドを中心に、日々のことも書いています。',
  },
  colorConverter: {
    title: 'カラーコード職人',
    description: 'HEX・RGB・HSLの色表現を相互に変換します。',
  },
  contrastChecker: {
    title: 'コントラストチェッカー',
    description:
      '2色のコントラスト比とAPCAのLc値を計算し、WCAGの基準で評価します。',
  },
  mojiCount: {
    title: 'もじカウント',
    description: 'テキストの文字数をリアルタイムに数えます。',
  },
  playgrounds: {
    title: 'Playgrounds',
    description: 'ブログ記事や興味のある技術の試作品を集めています。',
  },
  radiusMaker: {
    title: 'かどまるラボ',
    description: 'border-radiusを視覚的に操作してCSSを生成します。',
  },
  talks: {
    title: 'Talks',
    description: '過去の登壇テーマや資料へのリンクをまとめています。',
  },
} satisfies Record<string, LlmMetadata>;

export const assistPageMetadata = [
  pageMetadata.baseline,
  pageMetadata.mojiCount,
  pageMetadata.contrastChecker,
  pageMetadata.colorConverter,
  pageMetadata.radiusMaker,
];
