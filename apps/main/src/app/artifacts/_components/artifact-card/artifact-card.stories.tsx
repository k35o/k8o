import { expect, within } from 'storybook/test';

import preview from '../../../../../.storybook/preview';
import { ArtifactCard } from './artifact-card';

const meta = preview.meta({
  title: 'app/artifacts/artifact-card',
  component: ArtifactCard,
});

export const Primary = meta.story({
  args: {
    name: 'skills',
    description: 'ClaudeやCodexなどで使う自分用のAIエージェント向けskills集。',
    githubUrl: 'https://github.com/k35o/skills',
    websiteUrl: null,
    npmPackageName: null,
    tags: ['AI Agent', 'Skills'],
  },
});

export const WithoutNpm = meta.story({
  args: {
    name: 'dotfiles',
    description: '日々の開発環境を整えるためのdotfilesとセットアップ群。',
    githubUrl: 'https://github.com/k35o/dotfiles',
    websiteUrl: null,
    npmPackageName: null,
    tags: ['Shell', 'CLI', 'macOS'],
  },
});

export const DisplaysName = meta.story({
  args: {
    name: '@k8ordo/ui',
    description:
      'k8o.meのデザインシステム。コンポーネントやトークンを管理している。',
    githubUrl: 'https://github.com/k35o/k8ordo',
    websiteUrl: 'https://ordo.k8o.me',
    npmPackageName: null,
    tags: ['Design System', 'TypeScript', 'React'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: '@k8ordo/ui' }),
    ).toBeInTheDocument();
  },
});

export const DisplaysDescription = meta.story({
  args: {
    name: 'better-css-modules',
    description: 'CSS Modulesを扱いやすくするための実験的なツール。',
    githubUrl: 'https://github.com/k35o/better-css-modules',
    websiteUrl: null,
    npmPackageName: null,
    tags: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('CSS Modulesを扱いやすくするための実験的なツール。'),
    ).toBeInTheDocument();
  },
});

export const DisplaysTags = meta.story({
  args: {
    name: 'renovate-config',
    description: 'Renovateの設定を共通化するためのconfigリポジトリ。',
    githubUrl: 'https://github.com/k35o/renovate-config',
    websiteUrl: null,
    npmPackageName: null,
    tags: ['Renovate', 'Config', 'Automation'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Renovate')).toBeInTheDocument();
    await expect(canvas.getByText('Config')).toBeInTheDocument();
    await expect(canvas.getByText('Automation')).toBeInTheDocument();
  },
});

export const HasGitHubLink = meta.story({
  args: {
    name: 'skills',
    description: 'ClaudeやCodexなどで使う自分用のAIエージェント向けskills集。',
    githubUrl: 'https://github.com/k35o/skills',
    websiteUrl: null,
    npmPackageName: null,
    tags: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const githubLink = canvas.getByRole('link', { name: 'GitHubで見る' });
    await expect(githubLink).toBeInTheDocument();
    await expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/k35o/skills',
    );
  },
});

export const NoNpmLink = meta.story({
  args: {
    name: 'dotfiles',
    description: '日々の開発環境を整えるためのdotfilesとセットアップ群。',
    githubUrl: 'https://github.com/k35o/dotfiles',
    websiteUrl: null,
    npmPackageName: null,
    tags: ['Shell', 'CLI', 'macOS'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByRole('link', { name: 'npmで見る' }),
    ).not.toBeInTheDocument();
  },
});

export const HasWebsiteLink = meta.story({
  args: {
    name: '@k8ordo/ui',
    description:
      'k8o.meのデザインシステム。コンポーネントやトークンを管理している。',
    githubUrl: 'https://github.com/k35o/k8ordo',
    websiteUrl: 'https://ordo.k8o.me',
    npmPackageName: null,
    tags: ['Design System', 'TypeScript', 'React'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const websiteLink = canvas.getByRole('link', { name: 'サイトで見る' });
    await expect(websiteLink).toBeInTheDocument();
    await expect(websiteLink).toHaveAttribute('href', 'https://ordo.k8o.me');
  },
});
