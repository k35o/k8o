import { posix } from 'node:path';

import type { ESTree, Rule } from 'vite-plus/lint/plugins';

import { parseAppSrcPath } from './app-src-path.ts';

const FEATURE_LAYER_PATTERN =
  /^features\/([^/]+)\/(interface|application|infrastructure)(?:\/|$)/u;
const TEST_OR_STORY_PATTERN = /\.(?:test|stories)\.[cm]?[jt]sx?$/u;

type FeatureLayer = {
  feature: string;
  layer: string;
};

const parseFeatureLayer = (rel: string): FeatureLayer | null => {
  const match = FEATURE_LAYER_PATTERN.exec(rel);
  if (!match) {
    return null;
  }
  const [, feature, layer] = match;
  if (feature === undefined || layer === undefined) {
    return null;
  }
  return { feature, layer };
};

// specifier が指す先を、apps/<app>/src からの相対パスにする。src の中を指さなければ null
const resolveInSrc = (rel: string, specifier: string): string | null => {
  if (specifier.startsWith('@/')) {
    return specifier.slice(2);
  }
  if (!specifier.startsWith('.')) {
    return null;
  }
  const resolved = posix.join(posix.dirname(rel), specifier);
  return resolved.startsWith('..') ? null : resolved;
};

export type FeatureImportViolation =
  | 'outsideInterfaceOnly'
  | 'interfaceToInfrastructure'
  | 'crossFeatureInfrastructure';

export const judgeFeatureImport = (
  filename: string,
  specifier: string,
): FeatureImportViolation | null => {
  const location = parseAppSrcPath(filename);
  if (location === null || TEST_OR_STORY_PATTERN.test(location.rel)) {
    return null;
  }
  const target = resolveInSrc(location.rel, specifier);
  if (target === null) {
    return null;
  }
  const to = parseFeatureLayer(target);
  if (to === null) {
    return null;
  }
  const from = parseFeatureLayer(location.rel);
  if (from === null) {
    return to.layer === 'interface' ? null : 'outsideInterfaceOnly';
  }
  if (from.feature !== to.feature) {
    return to.layer === 'infrastructure' ? 'crossFeatureInfrastructure' : null;
  }
  return from.layer === 'interface' && to.layer === 'infrastructure'
    ? 'interfaceToInfrastructure'
    : null;
};

export const featureLayerBoundary: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'features の層（interface・application・infrastructure）をまたぐ import の向きを限定する',
    },
    messages: {
      outsideInterfaceOnly:
        "features の外から import できるのは features/*/interface だけ。'{{specifier}}' の関数や型は、その feature の interface から出して読む。",
      interfaceToInfrastructure:
        "interface から infrastructure は直に読まない。'{{specifier}}' を呼ぶユースケースを同じ feature の application に置き、interface はそれを呼ぶ。",
      crossFeatureInfrastructure:
        "別の feature の infrastructure は import しない。'{{specifier}}' の読み書きは、その feature の application か interface の関数を通す。",
    },
  },
  create(context) {
    const check = (
      source: ESTree.Expression | ESTree.StringLiteral | null | undefined,
    ): void => {
      if (source?.type !== 'Literal' || typeof source.value !== 'string') {
        return;
      }
      const violation = judgeFeatureImport(context.filename, source.value);
      if (violation === null) {
        return;
      }
      context.report({
        node: source,
        messageId: violation,
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
