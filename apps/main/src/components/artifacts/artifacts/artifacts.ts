export type ArtifactGroup =
  | 'k8ordo'
  | 'storybook'
  | 'lint'
  | 'config'
  | 'actions';

export type ArtifactIcon =
  | 'jellyfish'
  | 'calendar'
  | 'image'
  | 'dice'
  | 'flame'
  | 'rocket'
  | 'search'
  | 'paint'
  | 'settings'
  | 'refresh'
  | 'monitor'
  | 'pullRequest'
  | 'clipboardCheck';

export type Artifact = {
  name: string;
  description: string;
  group: ArtifactGroup;
  icon: ArtifactIcon;
  githubUrl: string;
  websiteUrl: string | null;
  // @k8ordo/* は同じ版でそろって出るので、k8ordo は @k8ordo/ui の版で代表する
  npmPackageName: string | null;
};

// 一覧に並べる順
export const ARTIFACT_GROUPS: ReadonlyArray<{
  group: ArtifactGroup;
  // 1 つだけのまとまりは見出しを出さず、大きなタイルで描く
  title: string | null;
}> = [
  { group: 'k8ordo', title: null },
  { group: 'storybook', title: 'Storybook' },
  { group: 'lint', title: 'Lint・CSS' },
  { group: 'config', title: 'Config' },
  { group: 'actions', title: 'GitHub Actions' },
];

export const getArtifacts = (): Artifact[] => [
  {
    name: 'k8ordo',
    group: 'k8ordo',
    icon: 'jellyfish',
    description:
      'Baselineに入った機能を待たずに使う、Reactのライブラリ群。UIコンポーネント、フレームワーク、ルーター、状態、フォームなど7つのパッケージからなる。',
    githubUrl: 'https://github.com/k35o/k8ordo',
    websiteUrl: 'https://ordo.k8o.me/ja/',
    npmPackageName: '@k8ordo/ui',
  },
  {
    name: 'storybook-addon-mock-date',
    group: 'storybook',
    icon: 'calendar',
    description:
      'Storybookのストーリー単位でDateやTemporal、タイマーをモックし、時刻に依存するコンポーネントを決定的に表示するアドオン。',
    githubUrl: 'https://github.com/k35o/storybook-addon-mock-date',
    websiteUrl: null,
    npmPackageName: 'storybook-addon-mock-date',
  },
  {
    name: 'storybook-addon-vrt',
    group: 'storybook',
    icon: 'image',
    description:
      'Vitestのブラウザモード上でStorybookのストーリーごとにスクリーンショットを撮り、ビジュアルリグレッションテストを行うツール。',
    githubUrl: 'https://github.com/k35o/storybook-addon-vrt',
    websiteUrl: null,
    npmPackageName: 'storybook-addon-vrt',
  },
  {
    name: 'storybook-addon-determinism',
    group: 'storybook',
    icon: 'dice',
    description:
      'StorybookのストーリーでMath.randomやcryptoをシードし、スナップショットやビジュアルリグレッションテストを決定的にするアドオン。',
    githubUrl: 'https://github.com/k35o/storybook-addon-determinism',
    websiteUrl: null,
    npmPackageName: 'storybook-addon-determinism',
  },
  {
    name: 'storybook-framework-hono-vite',
    group: 'storybook',
    icon: 'flame',
    description:
      'Hono JSXのコンポーネントを、ViteビルダーのStorybookで描画するためのフレームワーク。',
    githubUrl: 'https://github.com/k35o/storybook-framework-hono-vite',
    websiteUrl: null,
    npmPackageName: 'storybook-framework-hono-vite',
  },
  {
    name: '@k8o/create',
    group: 'config',
    icon: 'rocket',
    description:
      'vp create @k8oで、k8oの規約一式が入ったリポジトリの雛形を生成する。',
    githubUrl: 'https://github.com/k35o/templates',
    websiteUrl: null,
    npmPackageName: '@k8o/create',
  },
  {
    name: 'vite-plus-inspector',
    group: 'lint',
    icon: 'search',
    description:
      'Vite+の設定をブラウザで見られるようにするツール。oxlintのルールの重大度と、ファイルごとの適用状況を確認できる。',
    githubUrl: 'https://github.com/k35o/vite-plus-inspector',
    websiteUrl: null,
    npmPackageName: 'vite-plus-inspector',
  },
  {
    name: 'better-css-modules',
    group: 'lint',
    icon: 'paint',
    description:
      'CSS Modulesの型定義を生成し、未使用のクラスや、デザイントークンにない値を検出するツール。',
    githubUrl: 'https://github.com/k35o/better-css-modules',
    websiteUrl: null,
    npmPackageName: '@better-css-modules/core',
  },
  {
    name: '@k8o/oxc-config',
    group: 'lint',
    icon: 'settings',
    description:
      'Vite+で使う、oxlintとoxfmtの共有プリセット。TypeScriptやReact、Next.jsなど用途別に組み合わせる。',
    githubUrl: 'https://github.com/k35o/oxc-config',
    websiteUrl: null,
    npmPackageName: '@k8o/oxc-config',
  },
  {
    name: 'renovate-config',
    group: 'config',
    icon: 'refresh',
    description: 'Renovateの共有設定。',
    githubUrl: 'https://github.com/k35o/renovate-config',
    websiteUrl: null,
    npmPackageName: null,
  },
  {
    name: 'dotfiles',
    group: 'config',
    icon: 'monitor',
    description:
      'chezmoiで管理する、macOSの開発環境の設定一式。zshやgit、mise、Claude Codeの設定をまとめている。',
    githubUrl: 'https://github.com/k35o/dotfiles',
    websiteUrl: null,
    npmPackageName: null,
  },
  {
    name: 'pnpm-release-action',
    group: 'actions',
    icon: 'pullRequest',
    description:
      'pnpm組み込みのリリース管理をCIで動かすGitHub Action。リリースPRを作り、マージされたらnpmへの公開とタグ、GitHub Releasesの作成までを行う。',
    githubUrl: 'https://github.com/k35o/pnpm-release-action',
    websiteUrl: null,
    npmPackageName: null,
  },
  {
    name: 'patrol-board',
    group: 'actions',
    icon: 'clipboardCheck',
    description:
      'スクリプトを定期実行し、結果をGitHub Issueにダッシュボードとして表示するGitHub Action。',
    githubUrl: 'https://github.com/k35o/patrol-board',
    websiteUrl: null,
    npmPackageName: null,
  },
];
