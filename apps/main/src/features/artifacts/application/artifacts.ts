export type Artifact = {
  name: string;
  description: string;
  githubUrl: string;
  websiteUrl: string | null;
  npmPackageName: string | null;
  tags: string[];
};

export const getArtifacts = (): Artifact[] => [
  // デザインシステム
  {
    name: '@k8o/arte-odyssey',
    description:
      'k8oのデザインシステム。Reactコンポーネントとデザイントークンに加え、LLM駆動でUIを生成するアダプタを備える。',
    githubUrl: 'https://github.com/k35o/arte-odyssey',
    websiteUrl: 'https://arte-odyssey.k8o.me/',
    npmPackageName: '@k8o/arte-odyssey',
    tags: ['Design System', 'React', 'Generative UI'],
  },
  // Storybook 系
  {
    name: 'storybook-addon-mock-date',
    description:
      'Storybookのストーリー単位でDateやタイマーをモックし、時刻に依存するコンポーネントを決定的に表示するアドオン。',
    githubUrl: 'https://github.com/k35o/storybook-addon-mock-date',
    websiteUrl: null,
    npmPackageName: 'storybook-addon-mock-date',
    tags: ['Storybook', 'Date', 'Mock'],
  },
  {
    name: 'storybook-addon-vrt',
    description:
      'Vitestのブラウザモード上でStorybookのストーリーごとにスクリーンショットを撮り、ビジュアルリグレッションテストを行うツール。',
    githubUrl: 'https://github.com/k35o/storybook-addon-vrt',
    websiteUrl: null,
    npmPackageName: 'storybook-addon-vrt',
    tags: ['Storybook', 'Vitest', 'VRT'],
  },
  {
    name: 'storybook-addon-determinism',
    description:
      'StorybookのストーリーでMath.randomやcryptoをシードし、スナップショットやVRTを決定的にするアドオン。',
    githubUrl: 'https://github.com/k35o/storybook-addon-determinism',
    websiteUrl: null,
    npmPackageName: 'storybook-addon-determinism',
    tags: ['Storybook', 'Determinism', 'VRT'],
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
  // Vite+ / ビルドツール 系
  {
    name: '@k8o/create',
    description:
      'vp create @k8oで、k8oの規約一式が入ったリポジトリの雛形を生成するプロジェクトジェネレーター。',
    githubUrl: 'https://github.com/k35o/templates',
    websiteUrl: null,
    npmPackageName: '@k8o/create',
    tags: ['Vite+', 'Generator', 'Tool'],
  },
  {
    name: 'vite-plus-inspector',
    description:
      'vite-plusの設定をブラウザで可視化するinspector。oxlintのルールの重大度や適用状況を確認できる。',
    githubUrl: 'https://github.com/k35o/vite-plus-inspector',
    websiteUrl: null,
    npmPackageName: 'vite-plus-inspector',
    tags: ['Vite+', 'oxlint', 'CLI'],
  },
  {
    name: 'better-css-modules',
    description:
      'CSS Modulesから型定義を自動生成し、未使用クラスを検出して開発体験を高めるツールキット。',
    githubUrl: 'https://github.com/k35o/better-css-modules',
    websiteUrl: null,
    npmPackageName: '@better-css-modules/core',
    tags: ['CSS Modules', 'TypeScript', 'Vite', 'webpack'],
  },
  // 共通設定 / Personal
  {
    name: '@k8o/oxc-config',
    description:
      'oxlintとoxfmtの共有設定パッケージ。TypeScriptやReact、Next.jsなど用途別のプリセットを提供する。',
    githubUrl: 'https://github.com/k35o/oxc-config',
    websiteUrl: null,
    npmPackageName: '@k8o/oxc-config',
    tags: ['oxlint', 'oxfmt', 'Config'],
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
    description:
      'chezmoiで管理する開発環境の設定一式。zshやmise、ターミナル周りの設定をまとめている。',
    githubUrl: 'https://github.com/k35o/dotfiles',
    websiteUrl: null,
    npmPackageName: null,
    tags: ['Dotfiles', 'chezmoi', 'Shell', 'Personal'],
  },
  // 自動化 / GitHub Actions
  {
    name: 'patrol-board',
    description:
      'スクリプトを定期実行し、結果をGitHub Issueにダッシュボードとして表示するGitHub Action。',
    githubUrl: 'https://github.com/k35o/patrol-board',
    websiteUrl: null,
    npmPackageName: null,
    tags: ['GitHub Actions', 'Automation'],
  },
];
