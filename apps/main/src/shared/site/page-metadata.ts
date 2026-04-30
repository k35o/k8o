type LlmMetadata = {
  title: string;
  description: string;
};

export const pageMetadata = {
  artifacts: {
    title: 'Artifacts',
    description: 'dotfilesやskills、自作ツールなどの制作物をまとめています。',
  },
  baseConverter: {
    title: '基数チェンジャー',
    description: '2進数・8進数・10進数・16進数を相互に変換します。',
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
    description: '2色のコントラスト比を計算し、WCAGの基準で評価します。',
  },
  japaneseTextFixer: {
    title: '日本語校正くん',
    description: '日本語の文章を解析し、誤字脱字や文法ミスを指摘します。',
  },
  mojiCount: {
    title: 'もじカウント',
    description: 'テキストの文字数をリアルタイムに数えます。',
  },
  playgrounds: {
    title: 'Playgrounds',
    description: 'ブログ記事や興味のある技術の試作品を集めています。',
  },
  qrGenerator: {
    title: 'QRキット',
    description: 'テキストやURLからQRコードを生成してダウンロードできます。',
  },
  radiusMaker: {
    title: 'かどまるラボ',
    description: 'border-radiusを視覚的に操作してCSSを生成します。',
  },
  sqlTableBuilder: {
    title: 'SQLテーブルメーカー',
    description:
      'テーブル名・カラム・制約を入力してCREATE TABLE文を生成します。',
  },
  talks: {
    title: 'Talks',
    description: '過去の登壇テーマや資料へのリンクをまとめています。',
  },
  textDiff: {
    title: 'テキスト差分チェッカー',
    description: '2つのテキストを文字単位で比較して差分を表示します。',
  },
} satisfies Record<string, LlmMetadata>;

export const assistPageMetadata = [
  pageMetadata.mojiCount,
  pageMetadata.japaneseTextFixer,
  pageMetadata.qrGenerator,
  pageMetadata.baseConverter,
  pageMetadata.contrastChecker,
  pageMetadata.colorConverter,
  pageMetadata.radiusMaker,
  pageMetadata.sqlTableBuilder,
  pageMetadata.textDiff,
];
