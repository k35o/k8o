import { describe, expect, test } from 'vitest';

import { judgeFeatureImport } from './feature-layer-boundary.ts';

const file = (rel: string): string => `/Users/dev/k8o/${rel}`;

describe('judgeFeatureImport', () => {
  describe('正常系', () => {
    test('features の外からは interface を import できる', () => {
      expect(
        judgeFeatureImport(
          file('apps/ai/src/app/(authenticated)/chat/page.tsx'),
          '@/features/agent/interface/queries',
        ),
      ).toBeNull();
      expect(
        judgeFeatureImport(
          file('apps/main/src/components/blog/blog-index/blog-index.tsx'),
          '@/features/blog/interface/queries',
        ),
      ).toBeNull();
    });

    test('同じ feature の interface は application を import できる', () => {
      expect(
        judgeFeatureImport(
          file('apps/api/src/features/blog/interface/owner-routes.ts'),
          '../application/list-blogs',
        ),
      ).toBeNull();
    });

    test('同じ feature の application は infrastructure を import できる', () => {
      expect(
        judgeFeatureImport(
          file('apps/api/src/features/blog/application/list-blogs.ts'),
          '../infrastructure/blog-repository',
        ),
      ).toBeNull();
    });

    test('別の feature の interface と application は import できる', () => {
      expect(
        judgeFeatureImport(
          file('apps/ai/src/features/agent/application/generate-ui.ts'),
          '@/features/artifacts/application/artifacts',
        ),
      ).toBeNull();
      expect(
        judgeFeatureImport(
          file('apps/api/src/features/overview/interface/get-overview.ts'),
          '../../browser-support/interface/queries',
        ),
      ).toBeNull();
    });

    test('features を指さない specifier は対象外', () => {
      expect(
        judgeFeatureImport(file('apps/ai/src/app/page.tsx'), 'react'),
      ).toBeNull();
      expect(
        judgeFeatureImport(
          file('apps/ai/src/app/page.tsx'),
          '@/shared/auth/allowed-session',
        ),
      ).toBeNull();
    });

    test('apps/*/src の外は対象外', () => {
      expect(
        judgeFeatureImport(
          file('apps/main/.storybook/preview.tsx'),
          '../src/features/blog/application/blogs',
        ),
      ).toBeNull();
    });

    test('テストと Story は、差し替えや fixture のためにどの層も import できる', () => {
      expect(
        judgeFeatureImport(
          file('apps/ai/src/features/agent/interface/chat.test.ts'),
          '@/features/usage/infrastructure/usage-repository',
        ),
      ).toBeNull();
      expect(
        judgeFeatureImport(
          file(
            'apps/ai/src/app/(authenticated)/chat/_components/chat-view/chat-view.stories.tsx',
          ),
          '@/features/agent/application/chat-artifacts',
        ),
      ).toBeNull();
    });
  });

  describe('異常系', () => {
    test('features の外から application を import すると違反', () => {
      expect(
        judgeFeatureImport(
          file('apps/ai/src/app/(authenticated)/chat/page.tsx'),
          '@/features/agent/application/threads',
        ),
      ).toBe('outsideInterfaceOnly');
    });

    test('features の外から infrastructure を import すると違反', () => {
      expect(
        judgeFeatureImport(
          file('apps/api/src/public.ts'),
          './features/blog/infrastructure/blog-repository',
        ),
      ).toBe('outsideInterfaceOnly');
    });

    test('shared も features の外として扱う', () => {
      expect(
        judgeFeatureImport(
          file('apps/main/src/shared/site/sitemap.ts'),
          '@/features/blog/application/blogs',
        ),
      ).toBe('outsideInterfaceOnly');
    });

    test('同じ feature の interface から infrastructure を import すると違反', () => {
      expect(
        judgeFeatureImport(
          file('apps/api/src/features/blog/interface/owner-routes.ts'),
          '../infrastructure/blog-repository',
        ),
      ).toBe('interfaceToInfrastructure');
      expect(
        judgeFeatureImport(
          file('apps/api/src/features/blog/interface/owner-routes.ts'),
          '@/features/blog/infrastructure/blog-repository',
        ),
      ).toBe('interfaceToInfrastructure');
    });

    test('別の feature の infrastructure を import すると違反', () => {
      expect(
        judgeFeatureImport(
          file('apps/ai/src/features/agent/application/generate-ui.ts'),
          '@/features/artifacts/infrastructure/artifact-repository',
        ),
      ).toBe('crossFeatureInfrastructure');
      expect(
        judgeFeatureImport(
          file('apps/api/src/features/overview/interface/get-overview.ts'),
          '../../browser-support/infrastructure/browser-support-repository',
        ),
      ).toBe('crossFeatureInfrastructure');
    });
  });

  describe('エッジケース', () => {
    test('feature の直下のファイル（層の外）は、features の外と同じ扱い', () => {
      expect(
        judgeFeatureImport(
          file('apps/ai/src/features/agent/index.ts'),
          './application/threads',
        ),
      ).toBe('outsideInterfaceOnly');
    });

    test('層のディレクトリそのものを指す specifier も判定する', () => {
      expect(
        judgeFeatureImport(
          file('apps/ai/src/app/page.tsx'),
          '@/features/agent/application',
        ),
      ).toBe('outsideInterfaceOnly');
    });

    test('src の外へ出る相対 specifier は対象外', () => {
      expect(
        judgeFeatureImport(
          file('apps/ai/src/proxy.ts'),
          '../features/agent/application/threads',
        ),
      ).toBeNull();
    });
  });
});
