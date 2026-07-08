import { applyEdits, parseEdits } from './parse-edits';
import { parseGeneration } from './parse-generation';
import type { GenerationMeta } from './parse-meta';

export type ResolvedGeneration = {
  // 完全な TSX（差分編集なら適用結果）。プレビュー・保存にそのまま使える。
  code: string | null;
  meta: GenerationMeta | null;
  isComplete: boolean;
  // 応答の形式。null はまだどちらとも判定できない（コード未到達）。
  kind: 'full' | 'edits' | null;
  // 差分編集の適用に失敗したときのエラー（次ターンの buildErrors に流して全文再生成へ倒す）。
  editError: string | null;
  // 適用できた編集ブロック数（生成中の実況表示用）。
  appliedEdits: number;
};

// assistant 応答の生テキストを、全文（```tsx）/ 差分編集（```edits）のどちらの形式でも
// 「適用済みの完全なコード + meta」に解決する。ストリーミング中・完了後の双方で使う。
export const resolveGeneration = (
  raw: string,
  baseFile: string | null,
): ResolvedGeneration => {
  const edits = parseEdits(raw);
  if (!edits.isOpen) {
    const parsed = parseGeneration(raw);
    return {
      code: parsed.code,
      meta: parsed.meta,
      isComplete: parsed.isComplete,
      kind: parsed.code === null ? null : 'full',
      editError: null,
      appliedEdits: 0,
    };
  }

  // meta フェンスの形式は全文生成と共通。
  const { meta } = parseGeneration(raw);
  if (baseFile === null) {
    return {
      code: null,
      meta,
      isComplete: false,
      kind: 'edits',
      editError:
        '編集対象のコードが存在しないのに差分編集が出力されました。全文を出力してください。',
      appliedEdits: 0,
    };
  }

  const applied = applyEdits(baseFile, edits.blocks);
  let editError: string | null = null;
  if (applied.failed.length > 0) {
    editError = `編集ブロック ${applied.failed.join(', ')} の SEARCH が現在のコードに一致しませんでした。`;
  } else if (edits.isComplete && edits.blocks.length === 0) {
    // 空の編集で完了した場合、同一コードを新しい版として保存しないようエラーに倒す。
    editError = '編集ブロックが1つも出力されませんでした。';
  }
  return {
    code: applied.code,
    meta,
    isComplete: edits.isComplete && meta !== null,
    kind: 'edits',
    editError,
    appliedEdits: edits.blocks.length - applied.failed.length,
  };
};
