import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { ArtifactCard } from './artifact-card';

const meta: Meta<typeof ArtifactCard> = {
  title: 'app/artifacts/artifact-card',
  component: ArtifactCard,
};

export default meta;
type Story = StoryObj<typeof ArtifactCard>;

export const Primary: Story = {
  args: {
    name: 'skills',
    description: 'ClaudeやCodexなどで使う自分用のAIエージェント向けskills集。',
    githubUrl: 'https://github.com/k35o/skills',
    websiteUrl: null,
    npmPackageName: null,
    tags: ['AI Agent', 'Skills'],
  },
};

export const WithoutNpm: Story = {
  args: {
    name: 'dotfiles',
    description: '日々の開発環境を整えるためのdotfilesとセットアップ群。',
    githubUrl: 'https://github.com/k35o/dotfiles',
    websiteUrl: null,
    npmPackageName: null,
    tags: ['Shell', 'CLI', 'macOS'],
  },
};

export const DisplaysName: Story = {
  args: {
    name: 'ArteOdyssey',
    description:
      'k8o.meのデザインシステム。コンポーネントやトークンを管理している。',
    githubUrl: 'https://github.com/k35o/arte-odyssey',
    websiteUrl: 'https://arte-odyssey.k8o.me/',
    npmPackageName: null,
    tags: ['Design System', 'TypeScript', 'React'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // リポジトリ名が表示されていることを確認
    await expect(
      canvas.getByRole('heading', { name: 'ArteOdyssey' }),
    ).toBeInTheDocument();
  },
};

export const DisplaysDescription: Story = {
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

    // 説明文が表示されていることを確認
    await expect(
      canvas.getByText('CSS Modulesを扱いやすくするための実験的なツール。'),
    ).toBeInTheDocument();
  },
};

export const DisplaysTags: Story = {
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

    // タグが表示されていることを確認
    await expect(canvas.getByText('Renovate')).toBeInTheDocument();
    await expect(canvas.getByText('Config')).toBeInTheDocument();
    await expect(canvas.getByText('Automation')).toBeInTheDocument();
  },
};

export const HasGitHubLink: Story = {
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

    // GitHubリンクが存在することを確認
    const githubLink = canvas.getByRole('link', { name: 'GitHubで見る' });
    await expect(githubLink).toBeInTheDocument();
    await expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/k35o/skills',
    );
  },
};

export const NoNpmLink: Story = {
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

    // npmリンクが存在しないことを確認
    await expect(
      canvas.queryByRole('link', { name: 'npmで見る' }),
    ).not.toBeInTheDocument();
  },
};

export const HasWebsiteLink: Story = {
  args: {
    name: 'ArteOdyssey',
    description:
      'k8o.meのデザインシステム。コンポーネントやトークンを管理している。',
    githubUrl: 'https://github.com/k35o/arte-odyssey',
    websiteUrl: 'https://arte-odyssey.k8o.me/',
    npmPackageName: null,
    tags: ['Design System', 'TypeScript', 'React'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 公開サイトへのリンクが存在することを確認
    const websiteLink = canvas.getByRole('link', { name: 'サイトで見る' });
    await expect(websiteLink).toBeInTheDocument();
    await expect(websiteLink).toHaveAttribute(
      'href',
      'https://arte-odyssey.k8o.me/',
    );
  },
};
