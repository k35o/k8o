import { toMeta } from './parse-meta';
import type { GenerationMeta } from './parse-meta';

export type ParsedSlidesGeneration = {
  source: string | null;
  meta: GenerationMeta | null;
  isSourceComplete: boolean;
};

// デッキ本文はコードブロック（```）を含みうるため、外側はバッククォート4つ以上の
// フェンスで囲む取り決め（開きと同じ長さ以上の行で閉じる = CommonMark と同じ規則）。
const MD_OPEN = /^(`{3,})(?:md|markdown)[ \t]*$/mu;
const META_FENCE = /```json\n([\s\S]*?)```/u;
// 外側を3つのバッククォートで書かれると、中のコードブロックのフェンスの行でデッキが切れ、
// 本当の閉じフェンスが後ろに残る。meta より前にフェンスの行が残れば、切れたとみなす
const FENCE_ONLY_LINE = /^`{3,}[ \t]*$/mu;

// ストリーミング中・完了後の双方で使う。本文は md フェンス、meta は末尾 JSON フェンス。
export const parseSlidesGeneration = (raw: string): ParsedSlidesGeneration => {
  const open = MD_OPEN.exec(raw);
  let source: string | null = null;
  let sourceClosed = false;
  // meta の探索開始位置。デッキ内の ```json コードブロックを meta と誤認しないよう、
  // デッキが閉じた位置より後ろだけを見る。
  let metaFrom = 0;

  if (open?.[1] !== undefined) {
    const bodyStart = open.index + open[0].length + 1;
    const rest = raw.slice(bodyStart);
    const closeRe = new RegExp(
      `^\`{${open[1].length.toString()},}[ \\t]*$`,
      'mu',
    );
    const close = closeRe.exec(rest);
    if (close === null) {
      // 閉じフェンス未到達（ストリーミング途中）→ 途中までをプレビュー用に拾う。
      // 書きかけの閉じフェンス（末尾のバッククォート行）は本文に混ぜない。
      const partial = rest.replace(/\n`+[ \t]*$/u, '');
      source = partial.trim() === '' ? null : partial;
    } else {
      source = rest.slice(0, close.index).trim();
      sourceClosed = true;
      metaFrom = bodyStart + close.index + close[0].length;
    }
  }

  let meta: GenerationMeta | null = null;
  let isSourceComplete = false;
  // デッキが開いたまま閉じていない間は meta を探さない（本文中の json を誤検出しない）。
  if (open === null || sourceClosed) {
    const after = raw.slice(metaFrom);
    const metaMatch = META_FENCE.exec(after);
    if (metaMatch?.[1] !== undefined) {
      try {
        meta = toMeta(JSON.parse(metaMatch[1]));
      } catch {
        meta = null;
      }
    }
    const beforeMeta =
      metaMatch === null ? after : after.slice(0, metaMatch.index);
    isSourceComplete = sourceClosed && !FENCE_ONLY_LINE.test(beforeMeta);
  }

  return { source, meta, isSourceComplete };
};
