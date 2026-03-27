import { describe, expect, it } from 'vitest';
import { getOssProjects } from './oss';

describe('getOssProjects', () => {
  it('公開しているOSS一覧を返す', () => {
    const projects = getOssProjects();

    expect(projects).toHaveLength(2);
    expect(projects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'patrol-board',
          githubUrl: 'https://github.com/k35o/patrol-board',
          npmPackageName: null,
        }),
        expect.objectContaining({
          name: 'storybook-addon-mock-date',
          githubUrl: 'https://github.com/k35o/storybook-addon-mock-date',
          npmPackageName: 'storybook-addon-mock-date',
        }),
      ]),
    );

    for (const project of projects) {
      expect(project).toEqual(
        expect.objectContaining({
          name: expect.any(String),
          description: expect.any(String),
          githubUrl: expect.stringMatching(/^https:\/\/github\.com\//),
          tags: expect.any(Array),
        }),
      );
    }
  });
});
