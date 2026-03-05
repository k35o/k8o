import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { OssCard } from './oss-card';

const meta: Meta<typeof OssCard> = {
  title: 'app/oss/oss-card',
  component: OssCard,
};

export default meta;
type Story = StoryObj<typeof OssCard>;

export const Primary: Story = {
  args: {
    name: 'my-oss-project',
    description: 'OSSプロジェクトの説明文。',
    githubUrl: 'https://github.com/k35o/my-oss-project',
    npmPackageName: 'my-oss-project',
    tags: ['TypeScript', 'React'],
  },
};

export const WithoutNpm: Story = {
  args: {
    name: 'patrol-board',
    description:
      'スクリプトを定期実行し、結果をGitHub Issueにダッシュボードとして表示するGitHub Action。',
    githubUrl: 'https://github.com/k35o/patrol-board',
    npmPackageName: null,
    tags: ['TypeScript', 'GitHub Actions'],
  },
};

export const DisplaysName: Story = {
  args: {
    name: 'storybook-addon-mock-date',
    description:
      'Storybookのストーリーで日付・時刻をモックするためのアドオン。',
    githubUrl: 'https://github.com/k35o/storybook-addon-mock-date',
    npmPackageName: 'storybook-addon-mock-date',
    tags: ['TypeScript', 'Storybook'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // リポジトリ名が表示されていることを確認
    await expect(
      canvas.getByRole('heading', { name: 'storybook-addon-mock-date' }),
    ).toBeInTheDocument();
  },
};

export const DisplaysDescription: Story = {
  args: {
    name: 'my-oss-project',
    description: 'これはOSSプロジェクトの説明です。',
    githubUrl: 'https://github.com/k35o/my-oss-project',
    npmPackageName: null,
    tags: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 説明文が表示されていることを確認
    await expect(
      canvas.getByText('これはOSSプロジェクトの説明です。'),
    ).toBeInTheDocument();
  },
};

export const DisplaysTags: Story = {
  args: {
    name: 'my-oss-project',
    description: 'OSSプロジェクトの説明文。',
    githubUrl: 'https://github.com/k35o/my-oss-project',
    npmPackageName: null,
    tags: ['TypeScript', 'React', 'Next.js'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // タグが表示されていることを確認
    await expect(canvas.getByText('TypeScript')).toBeInTheDocument();
    await expect(canvas.getByText('React')).toBeInTheDocument();
    await expect(canvas.getByText('Next.js')).toBeInTheDocument();
  },
};

export const HasGitHubLink: Story = {
  args: {
    name: 'my-oss-project',
    description: 'OSSプロジェクトの説明文。',
    githubUrl: 'https://github.com/k35o/my-oss-project',
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
      'https://github.com/k35o/my-oss-project',
    );
  },
};

export const HasNpmLink: Story = {
  args: {
    name: 'my-oss-project',
    description: 'OSSプロジェクトの説明文。',
    githubUrl: 'https://github.com/k35o/my-oss-project',
    npmPackageName: 'my-oss-project',
    tags: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // npmリンクが存在することを確認
    const npmLink = canvas.getByRole('link', { name: 'npmで見る' });
    await expect(npmLink).toBeInTheDocument();
    await expect(npmLink).toHaveAttribute(
      'href',
      'https://www.npmjs.com/package/my-oss-project',
    );
  },
};

export const NoNpmLink: Story = {
  args: {
    name: 'patrol-board',
    description:
      'スクリプトを定期実行し、結果をGitHub Issueにダッシュボードとして表示するGitHub Action。',
    githubUrl: 'https://github.com/k35o/patrol-board',
    npmPackageName: null,
    tags: ['TypeScript', 'GitHub Actions'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // npmリンクが存在しないことを確認
    await expect(
      canvas.queryByRole('link', { name: 'npmで見る' }),
    ).not.toBeInTheDocument();
  },
};
