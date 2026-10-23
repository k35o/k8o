import { describe, expect, test } from 'vitest';

import { judgeDatabaseImport } from './database-import-boundary.ts';

const file = (rel: string): string => `/Users/dev/k8o/${rel}`;

describe('judgeDatabaseImport', () => {
  describe('正常系', () => {
    test('features/*/infrastructure からはどのサブパスも import できる', () => {
      expect(
        judgeDatabaseImport(
          file('apps/main/src/features/blog/infrastructure/blog-repository.ts'),
          '@repo/database',
        ),
      ).toBe('allowed');
      expect(
        judgeDatabaseImport(
          file(
            'apps/api/src/features/reading-list/infrastructure/reading-list-repository.ts',
          ),
          '@repo/database/schema',
        ),
      ).toBe('allowed');
    });

    test('features/*/application からも import できる', () => {
      expect(
        judgeDatabaseImport(
          file('apps/main/src/features/blog/application/blogs.ts'),
          '@repo/database',
        ),
      ).toBe('allowed');
    });

    test('ai の shared/auth からは @repo/ai-database/auth を import できる', () => {
      expect(
        judgeDatabaseImport(
          file('apps/ai/src/shared/auth/require-allowed-session.ts'),
          '@repo/ai-database/auth',
        ),
      ).toBe('allowed');
    });

    test('@repo/ai-database も features/*/infrastructure から import できる', () => {
      expect(
        judgeDatabaseImport(
          file(
            'apps/ai/src/features/artifacts/infrastructure/artifact-repository.ts',
          ),
          '@repo/ai-database/orm',
        ),
      ).toBe('allowed');
    });

    test('DB パッケージ以外の specifier は対象外', () => {
      expect(
        judgeDatabaseImport(file('apps/main/src/app/page.tsx'), 'react'),
      ).toBeNull();
    });

    test('apps/*/src の外（.storybook や packages）は対象外', () => {
      expect(
        judgeDatabaseImport(
          file('apps/main/.storybook/preview.tsx'),
          '@repo/database',
        ),
      ).toBeNull();
      expect(
        judgeDatabaseImport(
          file('packages/database/drizzle.config.ts'),
          '@repo/database',
        ),
      ).toBeNull();
    });
  });

  describe('異常系', () => {
    test('app/ からの import は禁止', () => {
      expect(
        judgeDatabaseImport(
          file('apps/ai/src/app/api/auth/[...all]/route.ts'),
          '@repo/ai-database/auth',
        ),
      ).toBe('forbiddenLayer');
    });

    test('@repo/ai-database も app/ からの import は禁止', () => {
      expect(
        judgeDatabaseImport(
          file('apps/ai/src/app/page.tsx'),
          '@repo/ai-database',
        ),
      ).toBe('forbiddenLayer');
    });

    test('features/*/interface からの import は禁止', () => {
      expect(
        judgeDatabaseImport(
          file('apps/main/src/features/blog/interface/actions.ts'),
          '@repo/database',
        ),
      ).toBe('forbiddenLayer');
    });

    test('shared/auth 以外の shared からの import は禁止', () => {
      expect(
        judgeDatabaseImport(
          file('apps/api/src/shared/cache/public-cache-control.ts'),
          '@repo/database',
        ),
      ).toBe('forbiddenLayer');
    });

    test('shared/auth でも auth 以外のサブパスは禁止', () => {
      expect(
        judgeDatabaseImport(
          file('apps/ai/src/shared/auth/require-allowed-session.ts'),
          '@repo/ai-database',
        ),
      ).toBe('authSubpathOnly');
      expect(
        judgeDatabaseImport(
          file('apps/ai/src/shared/auth/verify-session.ts'),
          '@repo/ai-database/schema',
        ),
      ).toBe('authSubpathOnly');
      expect(
        judgeDatabaseImport(
          file('apps/ai/src/shared/auth/require-allowed-session.ts'),
          '@repo/database',
        ),
      ).toBe('authSubpathOnly');
    });

    test('auth の共用例外は ai だけで、main と api には無い', () => {
      expect(
        judgeDatabaseImport(
          file('apps/main/src/shared/auth/session.ts'),
          '@repo/ai-database/auth',
        ),
      ).toBe('forbiddenLayer');
      expect(
        judgeDatabaseImport(
          file('apps/api/src/shared/auth/require-bearer-secret.ts'),
          '@repo/ai-database/auth',
        ),
      ).toBe('forbiddenLayer');
    });
  });

  describe('エッジケース', () => {
    test('@repo/database-xxx のような別パッケージは対象外', () => {
      expect(
        judgeDatabaseImport(
          file('apps/main/src/app/page.tsx'),
          '@repo/database-utils',
        ),
      ).toBeNull();
    });

    test('infrastructure ディレクトリ直下でなくファイル名の一致では許可しない', () => {
      expect(
        judgeDatabaseImport(
          file('apps/main/src/features/blog/infrastructure.ts'),
          '@repo/database',
        ),
      ).toBe('forbiddenLayer');
    });

    test('パスに apps/*/src が複数含まれる場合は最後のセグメントで判定する', () => {
      expect(
        judgeDatabaseImport(
          file(
            'apps/tools/src/fixtures/apps/main/src/features/x/infrastructure/repo.ts',
          ),
          '@repo/database',
        ),
      ).toBe('allowed');
    });

    test('Windows 形式のパス区切りでも判定できる', () => {
      expect(
        judgeDatabaseImport(
          'C:\\dev\\k8o\\apps\\main\\src\\app\\page.tsx',
          '@repo/database',
        ),
      ).toBe('forbiddenLayer');
    });
  });
});
