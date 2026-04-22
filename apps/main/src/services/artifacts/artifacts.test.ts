import { describe, expect, it } from 'vitest';
import { getArtifacts } from './artifacts';

describe('getArtifacts', () => {
  it('公開している制作物一覧を返す', () => {
    const projects = getArtifacts();

    expect(projects).toHaveLength(9);
    expect(projects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'ArteOdyssey',
          githubUrl: 'https://github.com/k35o/arte-odyssey',
          websiteUrl: 'https://arte-odyssey.k8o.me/',
          npmPackageName: null,
        }),
        expect.objectContaining({
          name: 'skills',
          githubUrl: 'https://github.com/k35o/skills',
          websiteUrl: null,
          npmPackageName: null,
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
          name: 'mdscroll',
          githubUrl: 'https://github.com/k35o/mdscroll',
          websiteUrl: null,
          npmPackageName: 'mdscroll',
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
