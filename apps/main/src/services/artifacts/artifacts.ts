export type Artifact = {
  name: string;
  description: string;
  githubUrl: string;
  websiteUrl: string | null;
  npmPackageName: string | null;
  tags: string[];
};

export const getArtifacts = (): Artifact[] => {
  return [
    {
      name: 'ArteOdyssey',
      description:
        'k8o.meのデザインシステム。コンポーネントやトークンを管理している。',
      githubUrl: 'https://github.com/k35o/arte-odyssey',
      websiteUrl: 'https://arte-odyssey.k8o.me/',
      npmPackageName: null,
      tags: ['Design System', 'TypeScript', 'React'],
    },
    {
      name: 'renovate-config',
      description:
        'Renovateの設定を共通化するためのconfigリポジトリ。',
      githubUrl: 'https://github.com/k35o/renovate-config',
      websiteUrl: null,
      npmPackageName: null,
      tags: ['Renovate', 'Config', 'Automation'],
    },
    {
      name: 'dotfiles',
      description: '日々の開発環境を整えるためのdotfilesとセットアップ群。',
      githubUrl: 'https://github.com/k35o/dotfiles',
      websiteUrl: null,
      npmPackageName: null,
      tags: ['Shell', 'CLI', 'macOS'],
    },
    {
      name: 'skills',
      description: 'ClaudeやCodexなどで使う自分用のAIエージェント向けskills集。',
      githubUrl: 'https://github.com/k35o/skills',
      websiteUrl: null,
      npmPackageName: null,
      tags: ['AI Agent', 'Skills', 'Automation'],
    },
    {
      name: 'better-css-modules',
      description: 'CSS Modulesを扱いやすくするための実験的なツール。',
      githubUrl: 'https://github.com/k35o/better-css-modules',
      websiteUrl: null,
      npmPackageName: '@better-css-modules/core',
      tags: ['CSS Modules', 'TypeScript', 'Tooling'],
    },
    {
      name: 'patrol-board',
      description:
        'スクリプトを定期実行し、結果をGitHub Issueにダッシュボードとして表示するGitHub Action。',
      githubUrl: 'https://github.com/k35o/patrol-board',
      websiteUrl: null,
      npmPackageName: null,
      tags: ['TypeScript', 'GitHub Actions'],
    },
    {
      name: 'storybook-addon-mock-date',
      description:
        'Storybookのストーリーで日付や時刻をモックするためのアドオン。',
      githubUrl: 'https://github.com/k35o/storybook-addon-mock-date',
      websiteUrl: null,
      npmPackageName: 'storybook-addon-mock-date',
      tags: ['TypeScript', 'Storybook'],
    },
  ];
};
