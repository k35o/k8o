import type { Spec } from '@json-render/core';
import type { ChatStatus } from 'ai';

import type { AgentUIMessage } from './agent-message';

type ArtifactToolPart = Extract<
  AgentUIMessage['parts'][number],
  { type: 'tool-generate_ui' | 'tool-generate_slides' }
>;

export type ArtifactLive = 'receiving' | 'waiting' | null;

type ArtifactContent =
  | { kind: 'ui'; spec: Spec | null }
  | { kind: 'slides'; source: string | null };

export type ArtifactKind = ArtifactContent['kind'];

export type ChatArtifact = ArtifactContent & {
  toolCallId: string;
  title: string;
  text: string;
  open: 'preview' | 'partial' | null;
} & (
    | { state: 'generating'; editingVersion: number | null }
    | { state: 'done'; artifactId: string; version: number }
    | { state: 'stopped' }
    | { state: 'failed' }
  );

export type PaneArtifact = Exclude<ChatArtifact, { state: 'failed' }>;

export type PaneVersion = { toolCallId: string; version: number };

export type PaneSelection =
  | { type: 'follow' }
  | { type: 'pinned'; toolCallId: string; lastCallKey: string | null }
  | { type: 'closed'; lastCallKey: string | null };

const PHASE_TEXT = {
  thinking: '考えています…',
  drawing: '描いています…',
  repairing: '検証エラーを直しています…',
  writing: 'スライドを書いています…',
} as const;

const DEFAULT_TITLES = {
  ui: 'UI',
  slides: 'スライド',
} as const satisfies Record<ArtifactKind, string>;

// 最後の出力は、確定の出力として届き直すまで preliminary のまま流れるので、書いている段階の文にする
const WRITING_PHASES = {
  ui: 'drawing',
  slides: 'writing',
} as const satisfies Record<ArtifactKind, keyof typeof PHASE_TEXT>;

const MAX_ERROR_CHARS = 300;

// サロゲートペアを途中で切らないよう、UTF-16 の長さではなく文字で数える
const truncate = (text: string): string => {
  const chars = Array.from(text);
  return chars.length <= MAX_ERROR_CHARS
    ? text
    : `${chars.slice(0, MAX_ERROR_CHARS).join('')}…`;
};

// 保存する errorText は Claude に送った文と同じでなければならないので、言い換えと切り詰めは表示の上だけで行う
export const artifactErrorText = (errorText: string): string => {
  if (errorText.startsWith('TimeoutError:')) {
    return '時間の上限に達したため止まりました';
  }
  if (errorText.startsWith('AbortError:')) {
    return '止まりました';
  }
  return truncate(errorText.replace(/^Error: /u, ''));
};

export const artifactLiveOf = (input: {
  status: ChatStatus;
  isServerRunning: boolean;
}): ArtifactLive => {
  if (input.status === 'streaming') {
    return 'receiving';
  }
  return input.isServerRunning && input.status !== 'submitted'
    ? 'waiting'
    : null;
};

const contentOf = (part: ArtifactToolPart): ArtifactContent => {
  switch (part.type) {
    case 'tool-generate_ui':
      return {
        kind: 'ui',
        spec: part.state === 'output-available' ? part.output.spec : null,
      };
    case 'tool-generate_slides':
      return {
        kind: 'slides',
        source: part.state === 'output-available' ? part.output.source : null,
      };
  }
};

const hasContent = (content: ArtifactContent): boolean =>
  content.kind === 'ui' ? content.spec !== null : content.source !== null;

export const chatArtifactOf = (
  part: ArtifactToolPart,
  { live, isStopping }: { live: ArtifactLive; isStopping: boolean },
): ChatArtifact => {
  const { toolCallId } = part;
  const content = contentOf(part);
  const title =
    part.input?.title === undefined || part.input.title === ''
      ? DEFAULT_TITLES[content.kind]
      : part.input.title;
  if (part.state === 'output-error') {
    return {
      ...content,
      toolCallId,
      title,
      text: artifactErrorText(part.errorText),
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
      ...content,
      toolCallId,
      title,
      text: part.output.summary,
      open: 'preview',
      state: 'done',
      artifactId: part.output.artifactId,
      version: part.output.version,
    };
  }
  const output = part.state === 'output-available' ? part.output : null;
  if (live === null) {
    return {
      ...content,
      toolCallId,
      title,
      text: '途中で止まりました',
      open: hasContent(content) ? 'partial' : null,
      state: 'stopped',
    };
  }
  const generating = {
    ...content,
    toolCallId,
    title,
    state: 'generating',
    editingVersion: part.input?.base?.version ?? null,
  } as const;
  if (isStopping || live === 'waiting') {
    return {
      ...generating,
      text: isStopping
        ? '停止しています…'
        : '生成を続けています。終わると最新に置き換わります',
      open: hasContent(content) ? 'preview' : null,
    };
  }
  if (output === null) {
    return { ...generating, text: '準備しています…', open: null };
  }
  return {
    ...generating,
    text: PHASE_TEXT[
      output.status === 'generating'
        ? output.phase
        : WRITING_PHASES[content.kind]
    ],
    open: 'preview',
  };
};

// 生きているのは、全体の最後のメッセージが assistant のときの、そのメッセージだけ。
// 前のメッセージに残った中断のパーツを、生成中と取り違えないため
export const chatArtifactsOf = (
  messages: AgentUIMessage[],
  { live, isStopping }: { live: ArtifactLive; isStopping: boolean },
): ChatArtifact[] =>
  messages.flatMap((message, index) => {
    const isLive =
      index === messages.length - 1 && message.role === 'assistant';
    return message.parts.flatMap((part) =>
      part.type === 'tool-generate_ui' || part.type === 'tool-generate_slides'
        ? [
            chatArtifactOf(
              part,
              isLive ? { live, isStopping } : { live: null, isStopping: false },
            ),
          ]
        : [],
    );
  });

const isPaneArtifact = (artifact: ChatArtifact): artifact is PaneArtifact =>
  artifact.state === 'generating' ||
  (artifact.state !== 'failed' && hasContent(artifact));

export const lastCallKeyOf = (artifacts: ChatArtifact[]): string | null =>
  artifacts.at(-1)?.toolCallId ?? null;

export const shownArtifact = (
  artifacts: ChatArtifact[],
  selection: PaneSelection,
): PaneArtifact | null => {
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
  artifacts: ChatArtifact[],
  shown: PaneArtifact | null,
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
