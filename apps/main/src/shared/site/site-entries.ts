type SiteEntry = {
  title: string;
  link: `/${string}` | `https://${string}`;
  description: string;
};

export const siteEntries: readonly SiteEntry[] = [
  {
    title: 'Blog',
    link: '/blog',
    description: 'Webフロントエンドを中心に、日々のことも書いています。',
  },
  {
    title: 'Talks',
    link: '/talks',
    description: '過去の登壇テーマや資料へのリンクをまとめています。',
  },
  {
    title: 'Artifacts',
    link: '/artifacts',
    description: '自作のライブラリやツール、設定をまとめています。',
  },
  {
    title: 'Readings',
    link: '/reading-list',
    description: '気になっている記事を集めて、あとから探せるようにしています。',
  },
  {
    title: 'Browser Support',
    link: '/browser-support',
    description: 'Webプラットフォーム機能のブラウザ対応状況を追跡します。',
  },
  {
    title: 'カラーHexクイズ',
    link: '/color-quiz',
    description: '色からHexコードを当てたり、Hexコードから色を選ぶクイズです。',
  },
  {
    title: 'fluida',
    link: 'https://fluida.k8o.me',
    description:
      '絵の具を流して模様を描く、フルイドアートのお絵かきWebアプリです。',
  },
];
