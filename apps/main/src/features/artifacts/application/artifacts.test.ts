import { getArtifacts } from './artifacts';

describe('getArtifacts', () => {
  it('公開している制作物一覧を返す', () => {
    const projects = getArtifacts();

    expect(projects).toHaveLength(11);
    expect(projects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: '@k8o/arte-odyssey',
          githubUrl: 'https://github.com/k35o/arte-odyssey',
          websiteUrl: 'https://arte-odyssey.k8o.me/',
          npmPackageName: '@k8o/arte-odyssey',
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
      ]),
    );

    for (const project of projects) {
      expect(project).toEqual(
        expect.objectContaining({
          name: expect.any(String) as string,
          description: expect.any(String) as string,
          githubUrl: expect.stringMatching(
            /^https:\/\/github\.com\//u,
          ) as string,
          tags: expect.any(Array) as string[],
        }),
      );
    }
  });
});
