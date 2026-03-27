import { describe, expect, it } from 'vitest';
import { getOssProjects } from './oss';

describe('getOssProjects', () => {
  it('公開しているOSS一覧を返す', () => {
    expect(getOssProjects()).toEqual([
      {
        name: 'patrol-board',
        description:
          'スクリプトを定期実行し、結果をGitHub Issueにダッシュボードとして表示するGitHub Action。',
        githubUrl: 'https://github.com/k35o/patrol-board',
        npmPackageName: null,
        tags: ['TypeScript', 'GitHub Actions'],
      },
      {
        name: 'storybook-addon-mock-date',
        description:
          'Storybookのストーリーで日付・時刻をモックするためのアドオン。',
        githubUrl: 'https://github.com/k35o/storybook-addon-mock-date',
        npmPackageName: 'storybook-addon-mock-date',
        tags: ['TypeScript', 'Storybook'],
      },
    ]);
  });
});
