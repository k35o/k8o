import { arteOdysseyRules, catalog } from '@k8o/arte-odyssey/json-render';

type BuildSpecSystemPromptInput = {
  repairPrompt?: string | null | undefined;
};

const hasText = (value?: string | null): value is string =>
  typeof value === 'string' && value.trim() !== '';

const K8O_SYSTEM =
  'あなたは k8o のデザインシステム「arte-odyssey」に精通した UI デザイナーです。ユーザーの要望から、arte-odyssey コンポーネントで構成された UI を生成します。';

// inline モード（会話文→パッチ）の会話文パートに求める形式。タイトル行は
// プロジェクト名・履歴表示の情報源になる（クライアントの parseSpecProse が抽出する）。
const RESPONSE_RULES = [
  '応答は必ず「タイトル: <このUIの短い名前>」の1行で始め、続けて今回の生成・変更内容を1〜2文の日本語で説明してから、パッチを出力する。',
  'UI の変更が不要な質問・相談には、パッチを出力せず日本語の文章だけで答える。',
  '余白はたっぷり取る。レイアウトは Stack / Grid の gap・padding で組み、詰め込みすぎない。',
];

export const buildSpecSystemPrompt = (
  input: BuildSpecSystemPromptInput = {},
): string => {
  const sections = [
    catalog.prompt({
      mode: 'inline',
      system: K8O_SYSTEM,
      customRules: [...arteOdysseyRules, ...RESPONSE_RULES],
    }),
  ];

  if (hasText(input.repairPrompt)) {
    sections.push(
      [
        '# 前回の出力は検証エラーになった。次の指摘をすべて解消した spec を出力すること',
        input.repairPrompt,
      ].join('\n'),
    );
  }

  return sections.join('\n\n');
};
