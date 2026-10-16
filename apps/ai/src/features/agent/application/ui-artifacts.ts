import type { Spec } from '@json-render/core';
import type { ChatStatus } from 'ai';

import type { AgentUIMessage } from './agent-message';

type UiToolPart = Extract<
  AgentUIMessage['parts'][number],
  { type: 'tool-generate_ui' }
>;

export type UiLive = 'receiving' | 'waiting' | null;

export type UiArtifactView = {
  toolCallId: string;
  title: string;
  spec: Spec | null;
  text: string;
  open: 'preview' | 'partial' | null;
} & (
  | { state: 'generating'; editingVersion: number | null }
  | { state: 'done'; artifactId: string; version: number }
  | { state: 'stopped' }
  | { state: 'failed' }
);

export type PaneArtifactView = Exclude<UiArtifactView, { state: 'failed' }>;

export type PaneVersion = { toolCallId: string; version: number };

export type PaneSelection =
  | { type: 'follow' }
  | { type: 'pinned'; toolCallId: string; lastCallKey: string | null }
  | { type: 'closed'; lastCallKey: string | null };

const PHASE_TEXT = {
  thinking: '考えています…',
  drawing: '描いています…',
  repairing: '検証エラーを直しています…',
} as const;

const MAX_ERROR_CHARS = 300;

// サロゲートペアを途中で切らないよう、UTF-16 の長さではなく文字で数える
const truncate = (text: string): string => {
  const chars = Array.from(text);
  return chars.length <= MAX_ERROR_CHARS
    ? text
    : `${chars.slice(0, MAX_ERROR_CHARS).join('')}…`;
};

// 保存する errorText は Claude に送った文と同じでなければならないので、言い換えと切り詰めは表示の上だけで行う
export const uiErrorText = (errorText: string): string => {
  if (errorText.startsWith('TimeoutError:')) {
    return '時間の上限に達したため止まりました';
  }
  if (errorText.startsWith('AbortError:')) {
    return '止まりました';
  }
  return truncate(errorText.replace(/^Error: /u, ''));
};

export const uiLiveOf = (input: {
  status: ChatStatus;
  isServerRunning: boolean;
}): UiLive => {
  if (input.status === 'streaming') {
    return 'receiving';
  }
  return input.isServerRunning && input.status !== 'submitted'
    ? 'waiting'
    : null;
};

export const uiArtifactView = (
  part: UiToolPart,
  { live, isStopping }: { live: UiLive; isStopping: boolean },
): UiArtifactView => {
  const { toolCallId } = part;
  const title =
    part.input?.title === undefined || part.input.title === ''
      ? 'UI'
      : part.input.title;
  if (part.state === 'output-error') {
    return {
      toolCallId,
      title,
      spec: null,
      text: uiErrorText(part.errorText),
      open: null,
      state: 'failed',
    };
  }
  if (
    part.state === 'output-available' &&
    part.preliminary !== true &&
    part.output.status === 'done'
  ) {
    return {
      toolCallId,
      title,
      spec: part.output.spec,
      text: part.output.summary,
      open: 'preview',
      state: 'done',
      artifactId: part.output.artifactId,
      version: part.output.version,
    };
  }
  const output = part.state === 'output-available' ? part.output : null;
  const spec = output?.spec ?? null;
  if (live === null) {
    return {
      toolCallId,
      title,
      spec,
      text: '途中で止まりました',
      open: spec === null ? null : 'partial',
      state: 'stopped',
    };
  }
  const generating = {
    toolCallId,
    title,
    spec,
    state: 'generating',
    editingVersion: part.input?.base?.version ?? null,
  } as const;
  if (isStopping || live === 'waiting') {
    return {
      ...generating,
      text: isStopping
        ? '停止しています…'
        : '生成を続けています。終わると最新に置き換わります',
      open: spec === null ? null : 'preview',
    };
  }
  if (output === null) {
    return { ...generating, text: '準備しています…', open: null };
  }
  return {
    ...generating,
    // 最後の出力は、確定の出力として届き直すまで preliminary のまま流れる
    text: PHASE_TEXT[output.status === 'generating' ? output.phase : 'drawing'],
    open: 'preview',
  };
};

// 生きているのは、全体の最後のメッセージが assistant のときの、そのメッセージだけ。
// 前のメッセージに残った中断のパーツを、生成中と取り違えないため
export const uiArtifactsOf = (
  messages: AgentUIMessage[],
  { live, isStopping }: { live: UiLive; isStopping: boolean },
): UiArtifactView[] =>
  messages.flatMap((message, index) => {
    const isLive =
      index === messages.length - 1 && message.role === 'assistant';
    return message.parts.flatMap((part) =>
      part.type === 'tool-generate_ui'
        ? [
            uiArtifactView(
              part,
              isLive ? { live, isStopping } : { live: null, isStopping: false },
            ),
          ]
        : [],
    );
  });

const isPaneArtifact = (
  artifact: UiArtifactView,
): artifact is PaneArtifactView =>
  artifact.state === 'generating' ||
  (artifact.state !== 'failed' && artifact.spec !== null);

export const lastCallKeyOf = (artifacts: UiArtifactView[]): string | null =>
  artifacts.at(-1)?.toolCallId ?? null;

export const shownArtifact = (
  artifacts: UiArtifactView[],
  selection: PaneSelection,
): PaneArtifactView | null => {
  const latest = artifacts.findLast(isPaneArtifact) ?? null;
  if (latest === null || selection.type === 'follow') {
    return latest;
  }
  // 新しい生成が失敗するか spec の無いまま止まって出せる最後が前に戻っても解けないよう、出せるかを問わない最後の呼び出しと比べる
  if (selection.lastCallKey !== lastCallKeyOf(artifacts)) {
    return latest;
  }
  if (selection.type === 'closed') {
    return null;
  }
  return (
    artifacts
      .filter(isPaneArtifact)
      .find((artifact) => artifact.toolCallId === selection.toolCallId) ??
    latest
  );
};

export const paneVersionsOf = (
  artifacts: UiArtifactView[],
  shown: PaneArtifactView | null,
): PaneVersion[] => {
  if (shown?.state !== 'done') {
    return [];
  }
  return artifacts.flatMap((artifact) =>
    artifact.state === 'done' && artifact.artifactId === shown.artifactId
      ? [{ toolCallId: artifact.toolCallId, version: artifact.version }]
      : [],
  );
};
