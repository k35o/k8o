import { describe, expect, it } from 'vitest';

import { ARTIFACT_GROUPS, getArtifacts } from './artifacts';

describe('getArtifacts', () => {
  it('公開している制作物一覧を返す', () => {
    const projects = getArtifacts();

    expect(projects).toHaveLength(13);
    expect(projects).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'k8ordo',
          githubUrl: 'https://github.com/k35o/k8ordo',
          websiteUrl: 'https://ordo.k8o.me/ja/',
          npmPackageName: '@k8ordo/ui',
        }),
        expect.objectContaining({
          name: '@k8o/oxc-config',
          githubUrl: 'https://github.com/k35o/oxc-config',
          websiteUrl: null,
          npmPackageName: '@k8o/oxc-config',
        }),
        expect.objectContaining({
          name: 'patrol-board',
          githubUrl: 'https://github.com/k35o/patrol-board',
          websiteUrl: null,
          npmPackageName: null,
        }),
        expect.objectContaining({
          name: 'pnpm-release-action',
          githubUrl: 'https://github.com/k35o/pnpm-release-action',
          websiteUrl: null,
          npmPackageName: null,
        }),
        expect.objectContaining({
          name: 'storybook-addon-mock-date',
          githubUrl: 'https://github.com/k35o/storybook-addon-mock-date',
          websiteUrl: null,
          npmPackageName: 'storybook-addon-mock-date',
        }),
        expect.objectContaining({
          name: 'storybook-framework-hono-vite',
          githubUrl: 'https://github.com/k35o/storybook-framework-hono-vite',
          websiteUrl: null,
          npmPackageName: 'storybook-framework-hono-vite',
        }),
        expect.objectContaining({
          name: 'storybook-addon-vrt',
          githubUrl: 'https://github.com/k35o/storybook-addon-vrt',
          websiteUrl: null,
          npmPackageName: 'storybook-addon-vrt',
        }),
        expect.objectContaining({
          name: 'storybook-addon-determinism',
          githubUrl: 'https://github.com/k35o/storybook-addon-determinism',
          websiteUrl: null,
          npmPackageName: 'storybook-addon-determinism',
        }),
      ]),
    );

    for (const project of projects) {
      expect(project).toStrictEqual(
        expect.objectContaining({
          name: expect.any(String) as string,
          description: expect.any(String) as string,
          githubUrl: expect.stringMatching(
            /^https:\/\/github\.com\//u,
          ) as string,
        }),
      );
    }
  });

  it('どの制作物も、一覧に並べるまとまりのどれかに入る', () => {
    const groups = new Set(ARTIFACT_GROUPS.map(({ group }) => group));

    expect(
      getArtifacts().filter(({ group }) => !groups.has(group)),
    ).toStrictEqual([]);
  });
});
