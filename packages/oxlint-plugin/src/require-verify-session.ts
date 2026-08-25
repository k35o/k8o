import type { ESTree, Rule } from '@oxlint/plugins';

import { parseAppSrcPath } from './app-src-path.ts';

type ActionFunction = ESTree.Function | ESTree.ArrowFunctionExpression;
type ProgramItem = ESTree.Directive | ESTree.Statement;

const hasUseServerDirective = (body: readonly ProgramItem[]): boolean => {
  for (const item of body) {
    if (
      item.type !== 'ExpressionStatement' ||
      typeof item.directive !== 'string'
    ) {
      break;
    }
    if (item.directive === 'use server') {
      return true;
    }
  }
  return false;
};

// import 元までは解決しない（識別子名の一致のみ）。同名の別関数で機械的には
// すり抜けられるが、このルールが守るのは掛け忘れで、意図的な回避はレビューで見る。
const isVerifySessionCall = (expression: ESTree.Expression): boolean =>
  expression.type === 'CallExpression' &&
  expression.callee.type === 'Identifier' &&
  expression.callee.name === 'verifySession';

// verifySession が Promise<void> を返す前提で、`await verifySession();` という
// 単独の式文だけを「先頭で呼んだ」と認める。戻り値を使う設計に変えたらここも更新する。
const startsWithVerifySession = (fn: ActionFunction): boolean => {
  const { body } = fn;
  if (body === null) {
    return false;
  }
  if (body.type !== 'BlockStatement') {
    // 式ボディの arrow。verifySession() 自体を返す形だけ許す
    return isVerifySessionCall(body);
  }
  for (const item of body.body) {
    if (
      item.type === 'ExpressionStatement' &&
      typeof item.directive === 'string'
    ) {
      continue;
    }
    return (
      item.type === 'ExpressionStatement' &&
      item.expression.type === 'AwaitExpression' &&
      isVerifySessionCall(item.expression.argument)
    );
  }
  return false;
};

const isFunctionNode = (node: ESTree.Node): node is ActionFunction =>
  node.type === 'FunctionDeclaration' ||
  node.type === 'FunctionExpression' ||
  node.type === 'ArrowFunctionExpression';

type CollectedFunction = {
  fn: ActionFunction;
  reportNode: ESTree.Node;
};

// export { f } / export default f で参照されうるトップレベル関数を名前で引けるようにする
const collectTopLevelFunctions = (
  body: readonly ProgramItem[],
): Map<string, CollectedFunction> => {
  const functions = new Map<string, CollectedFunction>();
  for (const item of body) {
    if (item.type === 'FunctionDeclaration' && item.id !== null) {
      functions.set(item.id.name, { fn: item, reportNode: item.id });
      continue;
    }
    if (item.type !== 'VariableDeclaration') {
      continue;
    }
    for (const declarator of item.declarations) {
      if (
        declarator.id.type === 'Identifier' &&
        declarator.init !== null &&
        isFunctionNode(declarator.init)
      ) {
        functions.set(declarator.id.name, {
          fn: declarator.init,
          reportNode: declarator.id,
        });
      }
    }
  }
  return functions;
};

export const requireVerifySession: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        "admin の Server Action（'use server'）に先頭の await verifySession() を強制する",
    },
    messages: {
      missingVerifySession:
        'Server Action は本体の先頭で await verifySession() を呼ぶ。認可はこの1行に依存していて、漏れてもビルドもテストも落ちない。',
      unverifiableExport:
        "'use server' ファイルのこの export は Server Action として検証できない。export async function（または export const f = async () => {}）の形で定義し、先頭で await verifySession() を呼ぶ。",
    },
  },
  create(context) {
    if (parseAppSrcPath(context.filename)?.app !== 'admin') {
      return {};
    }

    const checked = new Set<ActionFunction>();
    const checkAction = (fn: ActionFunction, reportNode: ESTree.Node): void => {
      if (checked.has(fn)) {
        return;
      }
      checked.add(fn);
      // 非asyncの export は Next.js のビルドが弾くため対象外
      if (
        !fn.async ||
        (fn.type !== 'ArrowFunctionExpression' && fn.body === null)
      ) {
        return;
      }
      if (startsWithVerifySession(fn)) {
        return;
      }
      context.report({ node: reportNode, messageId: 'missingVerifySession' });
    };
    const reportUnverifiable = (node: ESTree.Node): void => {
      context.report({ node, messageId: 'unverifiableExport' });
    };

    const checkNamedExport = (
      statement: ESTree.ExportNamedDeclaration,
      topLevelFunctions: Map<string, CollectedFunction>,
    ): void => {
      if (statement.exportKind === 'type') {
        return;
      }
      const { declaration } = statement;
      if (declaration !== null) {
        if (declaration.type === 'FunctionDeclaration') {
          checkAction(declaration, declaration.id ?? declaration);
          return;
        }
        if (declaration.type === 'VariableDeclaration') {
          for (const declarator of declaration.declarations) {
            if (declarator.init !== null && isFunctionNode(declarator.init)) {
              checkAction(declarator.init, declarator.id);
            } else {
              reportUnverifiable(declarator.id);
            }
          }
        }
        return;
      }
      if (statement.source !== null) {
        // 再exportは定義元を辿れないため、Server Action はこのファイルで定義させる
        reportUnverifiable(statement);
        return;
      }
      for (const specifier of statement.specifiers) {
        if (
          specifier.exportKind === 'type' ||
          specifier.local.type !== 'Identifier'
        ) {
          continue;
        }
        const collected = topLevelFunctions.get(specifier.local.name);
        if (collected === undefined) {
          reportUnverifiable(specifier);
        } else {
          checkAction(collected.fn, collected.reportNode);
        }
      }
    };

    const checkDefaultExport = (
      statement: ESTree.ExportDefaultDeclaration,
      topLevelFunctions: Map<string, CollectedFunction>,
    ): void => {
      const { declaration } = statement;
      if (isFunctionNode(declaration)) {
        checkAction(declaration, declaration.id ?? declaration);
        return;
      }
      if (declaration.type === 'Identifier') {
        const collected = topLevelFunctions.get(declaration.name);
        if (collected === undefined) {
          reportUnverifiable(declaration);
        } else {
          checkAction(collected.fn, collected.reportNode);
        }
        return;
      }
      reportUnverifiable(declaration);
    };

    // 関数単位の 'use server'（インライン Server Action）は export に関係なく検証する
    const checkInlineAction = (fn: ActionFunction): void => {
      if (
        fn.body?.type === 'BlockStatement' &&
        hasUseServerDirective(fn.body.body)
      ) {
        checkAction(fn, fn.id ?? fn);
      }
    };

    return {
      Program(program) {
        if (!hasUseServerDirective(program.body)) {
          return;
        }
        const topLevelFunctions = collectTopLevelFunctions(program.body);
        for (const item of program.body) {
          if (item.type === 'ExportNamedDeclaration') {
            checkNamedExport(item, topLevelFunctions);
          } else if (item.type === 'ExportDefaultDeclaration') {
            checkDefaultExport(item, topLevelFunctions);
          } else if (
            item.type === 'ExportAllDeclaration' &&
            item.exportKind !== 'type'
          ) {
            reportUnverifiable(item);
          }
        }
      },
      FunctionDeclaration(node) {
        checkInlineAction(node);
      },
      FunctionExpression(node) {
        checkInlineAction(node);
      },
      ArrowFunctionExpression(node) {
        checkInlineAction(node);
      },
    };
  },
};
