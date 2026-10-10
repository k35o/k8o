import type { ESTree, Rule } from '@oxlint/plugins';

import { parseAppSrcPath } from './app-src-path.ts';

const DATABASE_PACKAGES = ['@repo/database', '@repo/ai-database'];
const AUTH_SPECIFIER = '@repo/ai-database/auth';

const ALLOWED_LAYER_PATTERN =
  /^features\/[^/]+\/(?:infrastructure|application)\//u;
const AUTH_SHARED_APPS = new Set(['ai']);

const isDatabaseSpecifier = (specifier: string): boolean =>
  DATABASE_PACKAGES.some(
    (pkg) => specifier === pkg || specifier.startsWith(`${pkg}/`),
  );

export type DatabaseImportVerdict =
  | 'allowed'
  | 'authSubpathOnly'
  | 'forbiddenLayer';

export const judgeDatabaseImport = (
  filename: string,
  specifier: string,
): DatabaseImportVerdict | null => {
  if (!isDatabaseSpecifier(specifier)) {
    return null;
  }
  const location = parseAppSrcPath(filename);
  // apps/*/src の外（.storybook や packages など）は境界規約の対象外
  if (location === null) {
    return null;
  }
  if (ALLOWED_LAYER_PATTERN.test(location.rel)) {
    return 'allowed';
  }
  if (
    AUTH_SHARED_APPS.has(location.app) &&
    location.rel.startsWith('shared/auth/')
  ) {
    return specifier === AUTH_SPECIFIER ? 'allowed' : 'authSubpathOnly';
  }
  return 'forbiddenLayer';
};

export const databaseImportBoundary: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'DB パッケージ（@repo/database・@repo/ai-database）の import を features/*/infrastructure（読み取りのみ features/*/application も可）に限定する',
    },
    messages: {
      forbiddenLayer:
        "'{{specifier}}' を import できるのは features/*/infrastructure（小さな読み取りは features/*/application も可）だけ。DBアクセスはそこへ切り出し、app / interface からはそれを呼ぶ。",
      authSubpathOnly:
        "shared/auth から import できるのは '@repo/ai-database/auth' だけ。'{{specifier}}' へのアクセスは features/*/infrastructure へ切り出す。",
    },
  },
  create(context) {
    const check = (
      source: ESTree.Expression | ESTree.StringLiteral | null | undefined,
    ): void => {
      if (source?.type !== 'Literal' || typeof source.value !== 'string') {
        return;
      }
      const verdict = judgeDatabaseImport(context.filename, source.value);
      if (verdict === null || verdict === 'allowed') {
        return;
      }
      context.report({
        node: source,
        messageId: verdict,
        data: { specifier: source.value },
      });
    };
    return {
      ImportDeclaration(node) {
        check(node.source);
      },
      ExportNamedDeclaration(node) {
        check(node.source);
      },
      ExportAllDeclaration(node) {
        check(node.source);
      },
      ImportExpression(node) {
        check(node.source);
      },
      TSImportType(node) {
        check(node.source);
      },
    };
  },
};
