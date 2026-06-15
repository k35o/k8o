export type Artifact = {
  name: string;
  description: string;
  githubUrl: string;
  websiteUrl: string | null;
  npmPackageName: string | null;
  tags: string[];
};

export const getArtifacts = (): Artifact[] => [
  {
    name: 'ArteOdyssey',
    description:
      'k8o.meのデザインシステム。コンポーネントやトークンを管理している。',
    githubUrl: 'https://github.com/k35o/arte-odyssey',
    websiteUrl: 'https://arte-odyssey.k8o.me/',
    npmPackageName: null,
    tags: ['Design System', 'React'],
  },
  {
    name: 'renovate-config',
    description: 'Renovateの設定を共通化するためのconfigリポジトリ。',
    githubUrl: 'https://github.com/k35o/renovate-config',
    websiteUrl: null,
    npmPackageName: null,
    tags: ['Renovate', 'Config', 'Personal'],
  },
  {
    name: 'dotfiles',
    description: '日々の開発環境を整えるためのdotfilesとセットアップ群。',
    githubUrl: 'https://github.com/k35o/dotfiles',
    websiteUrl: null,
    npmPackageName: null,
    tags: ['Dotfiles', 'Shell', 'Config', 'Personal'],
  },
  {
    name: 'better-css-modules',
    description: 'CSS Modulesを扱いやすくするための実験的なツール。',
    githubUrl: 'https://github.com/k35o/better-css-modules',
    websiteUrl: null,
    npmPackageName: '@better-css-modules/core',
    tags: ['CSS Modules', 'webpack', 'Vite', 'Turbopack'],
  },
  {
    name: 'patrol-board',
    description:
      'スクリプトを定期実行し、結果をGitHub Issueにダッシュボードとして表示するGitHub Action。',
    githubUrl: 'https://github.com/k35o/patrol-board',
    websiteUrl: null,
    npmPackageName: null,
    tags: ['GitHub Actions', 'Tool'],
  },
  {
    name: 'storybook-addon-mock-date',
    description:
      'Storybookのストーリーで日付や時刻をモックするためのアドオン。',
    githubUrl: 'https://github.com/k35o/storybook-addon-mock-date',
    websiteUrl: null,
    npmPackageName: 'storybook-addon-mock-date',
    tags: ['Storybook', 'Date'],
  },
  {
    name: 'storybook-framework-hono-vite',
    description:
      'Hono JSXで書いたコンポーネントを@storybook/react-viteと同じ感覚で扱うためのStorybookフレームワーク。',
    githubUrl: 'https://github.com/k35o/storybook-framework-hono-vite',
    websiteUrl: null,
    npmPackageName: 'storybook-framework-hono-vite',
    tags: ['Storybook', 'Hono', 'Vite'],
  },
  {
    name: 'storybook-addon-vrt',
    description:
      'Storybookのストーリーごとにスクリーンショットを撮り、ビジュアルリグレッションテストを行うアドオン。',
    githubUrl: 'https://github.com/k35o/storybook-addon-vrt',
    websiteUrl: null,
    npmPackageName: 'storybook-addon-vrt',
    tags: ['Storybook', 'VRT'],
  },
  {
    name: 'oxc-config',
    description: 'oxlintの設定を共通化するためのconfigリポジトリ。',
    githubUrl: 'https://github.com/k35o/oxc-config',
    websiteUrl: null,
    npmPackageName: '@k8o/oxc-config',
    tags: ['oxlint', 'Config', 'Personal'],
  },
  {
    name: '@k8o/create',
    description:
      'vp create @k8oで、k8oの規約一式が入ったリポジトリの雛形を生成するプロジェクトジェネレーター。',
    githubUrl: 'https://github.com/k35o/templates',
    websiteUrl: null,
    npmPackageName: '@k8o/create',
    tags: ['Vite+', 'Generator', 'Tool'],
  },
];
