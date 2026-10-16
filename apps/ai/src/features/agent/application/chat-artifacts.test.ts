import type { Spec } from '@json-render/core';
import { describe, expect, it } from 'vitest';

import type { AgentUIMessage } from './agent-message';
import {
  artifactErrorText,
  artifactLiveOf,
  chatArtifactOf,
  chatArtifactsOf,
  lastCallKeyOf,
  paneVersionsOf,
  shownArtifact,
} from './chat-artifacts';
import type { ChatArtifact } from './chat-artifacts';

type UiToolPart = Extract<
  AgentUIMessage['parts'][number],
  { type: 'tool-generate_ui' }
>;
type SlidesToolPart = Extract<
  AgentUIMessage['parts'][number],
  { type: 'tool-generate_slides' }
>;

const BUTTON: Spec = {
  root: 'ok',
  elements: { ok: { type: 'Button', props: { label: 'OK' } } },
};

const INPUT = { title: '料金表', instruction: '3列で比べる' };
const EDIT_INPUT = {
  title: '料金表',
  base: { artifactId: 'a1b2c3d4e5f6', version: 2 },
  instruction: 'ボタンを大きく',
};

const parts = {
  inputStreaming: {
    type: 'tool-generate_ui',
    toolCallId: 'call-input',
    state: 'input-streaming',
    input: { title: '料金' },
  },
  inputAvailable: {
    type: 'tool-generate_ui',
    toolCallId: 'call-input',
    state: 'input-available',
    input: INPUT,
  },
  thinking: {
    type: 'tool-generate_ui',
    toolCallId: 'call-thinking',
    state: 'output-available',
    preliminary: true,
    input: INPUT,
    output: { status: 'generating', phase: 'thinking', spec: null },
  },
  drawing: {
    type: 'tool-generate_ui',
    toolCallId: 'call-drawing',
    state: 'output-available',
    preliminary: true,
    input: INPUT,
    output: { status: 'generating', phase: 'drawing', spec: BUTTON },
  },
  repairing: {
    type: 'tool-generate_ui',
    toolCallId: 'call-repairing',
    state: 'output-available',
    preliminary: true,
    input: EDIT_INPUT,
    output: { status: 'generating', phase: 'repairing', spec: BUTTON },
  },
  done: {
    type: 'tool-generate_ui',
    toolCallId: 'call-done',
    state: 'output-available',
    input: INPUT,
    output: {
      status: 'done',
      artifactId: 'a1b2c3d4e5f6',
      version: 1,
      summary: '3つのプランを並べました。',
      spec: BUTTON,
    },
  },
  failed: {
    type: 'tool-generate_ui',
    toolCallId: 'call-failed',
    state: 'output-error',
    input: INPUT,
    errorText: 'Error: UI の検証エラーを直せませんでした: [ok] bogus',
  },
} satisfies Record<string, UiToolPart>;

const DECK = [
  '<Cover>',
  '# TypeScript 入門',
  '</Cover>',
  '',
  '---',
  '',
  '## 型とは',
].join('\n');

const SLIDES_INPUT = { title: 'TypeScript 入門', instruction: '5枚で' };
const SLIDES_EDIT_INPUT = {
  title: 'TypeScript 入門',
  base: { artifactId: 's1t2u3v4w5x6', version: 1 },
  instruction: '3枚目のコードを短く',
};

const slidesParts = {
  inputAvailable: {
    type: 'tool-generate_slides',
    toolCallId: 'slides-input',
    state: 'input-available',
    input: SLIDES_INPUT,
  },
  thinking: {
    type: 'tool-generate_slides',
    toolCallId: 'slides-thinking',
    state: 'output-available',
    preliminary: true,
    input: SLIDES_EDIT_INPUT,
    output: { status: 'generating', phase: 'thinking', source: null },
  },
  writing: {
    type: 'tool-generate_slides',
    toolCallId: 'slides-writing',
    state: 'output-available',
    preliminary: true,
    input: SLIDES_INPUT,
    output: { status: 'generating', phase: 'writing', source: DECK },
  },
  done: {
    type: 'tool-generate_slides',
    toolCallId: 'slides-done',
    state: 'output-available',
    input: SLIDES_INPUT,
    output: {
      status: 'done',
      artifactId: 's1t2u3v4w5x6',
      version: 1,
      summary: '型の基礎を5枚にまとめました。',
      source: DECK,
    },
  },
  failed: {
    type: 'tool-generate_slides',
    toolCallId: 'slides-failed',
    state: 'output-error',
    input: SLIDES_INPUT,
    errorText:
      'Error: スライドを読み取れませんでした: スライドが1枚もありません',
  },
} satisfies Record<string, SlidesToolPart>;

const notLive = { live: null, isStopping: false } as const;
const receiving = { live: 'receiving', isStopping: false } as const;
const waiting = { live: 'waiting', isStopping: false } as const;

const assistant = (
  id: string,
  ...toolParts: Array<UiToolPart | SlidesToolPart>
): AgentUIMessage => ({
  id,
  role: 'assistant',
  parts: [{ type: 'step-start' }, ...toolParts],
});

const user = (id: string): AgentUIMessage => ({
  id,
  role: 'user',
  parts: [{ type: 'text', text: 'UI を作って' }],
});

const keysOf = (artifacts: ChatArtifact[]): string[] =>
  artifacts.map((artifact) => artifact.toolCallId);

describe('chatArtifactOf', () => {
  describe('正常系', () => {
    it('入力が届いているあいだは準備中で、ボタンを出さない', () => {
      expect(chatArtifactOf(parts.inputAvailable, receiving)).toStrictEqual({
        kind: 'ui',
        toolCallId: 'call-input',
        title: '料金表',
        spec: null,
        text: '準備しています…',
        open: null,
        state: 'generating',
        editingVersion: null,
      });
    });

    it.each([
      ['考えている', parts.thinking, '考えています…', null],
      ['描いている', parts.drawing, '描いています…', BUTTON],
      ['直している', parts.repairing, '検証エラーを直しています…', BUTTON],
    ])(
      '%s途中の出力を受信しているあいだは、段階の文とボタンを出す',
      (_, part, text, spec) => {
        expect(chatArtifactOf(part, receiving)).toMatchObject({
          state: 'generating',
          text,
          spec,
          open: 'preview',
        });
      },
    );

    it('直しているあいだは、土台の版を添える', () => {
      expect(chatArtifactOf(parts.repairing, receiving)).toMatchObject({
        state: 'generating',
        editingVersion: 2,
      });
    });

    it('確定の出力は、要約と版を出す', () => {
      expect(chatArtifactOf(parts.done, notLive)).toStrictEqual({
        kind: 'ui',
        toolCallId: 'call-done',
        title: '料金表',
        spec: BUTTON,
        text: '3つのプランを並べました。',
        open: 'preview',
        state: 'done',
        artifactId: 'a1b2c3d4e5f6',
        version: 1,
      });
    });

    it('失敗は、表示用に直したエラーの文を出し、ボタンを出さない', () => {
      expect(chatArtifactOf(parts.failed, receiving)).toStrictEqual({
        kind: 'ui',
        toolCallId: 'call-failed',
        title: '料金表',
        spec: null,
        text: 'UI の検証エラーを直せませんでした: [ok] bogus',
        open: null,
        state: 'failed',
      });
    });
  });

  describe('異常系', () => {
    it('受信が切れてサーバーを待つあいだは、待っている文にし、spec があればボタンを出す', () => {
      expect(chatArtifactOf(parts.drawing, waiting)).toMatchObject({
        state: 'generating',
        text: '生成を続けています。終わると最新に置き換わります',
        open: 'preview',
      });
      expect(chatArtifactOf(parts.thinking, waiting)).toMatchObject({
        state: 'generating',
        open: null,
      });
    });

    it('止めているあいだは、受信中でも待っていても「停止しています…」にする', () => {
      for (const live of ['receiving', 'waiting'] as const) {
        expect(
          chatArtifactOf(parts.drawing, { live, isStopping: true }),
        ).toMatchObject({
          state: 'generating',
          text: '停止しています…',
          open: 'preview',
        });
      }
    });

    it('生きていないメッセージの途中の出力は、途中で止まったものとして spec を開ける', () => {
      expect(chatArtifactOf(parts.drawing, notLive)).toStrictEqual({
        kind: 'ui',
        toolCallId: 'call-drawing',
        title: '料金表',
        spec: BUTTON,
        text: '途中で止まりました',
        open: 'partial',
        state: 'stopped',
      });
    });

    it('spec の無いまま止まったものは、ボタンを出さない', () => {
      expect(chatArtifactOf(parts.inputAvailable, notLive)).toMatchObject({
        state: 'stopped',
        open: null,
      });
      expect(chatArtifactOf(parts.thinking, notLive)).toMatchObject({
        state: 'stopped',
        open: null,
      });
    });
  });

  describe('エッジケース', () => {
    it('入力が届き始めたばかりなら、届いた分のタイトルを出す', () => {
      expect(chatArtifactOf(parts.inputStreaming, receiving)).toMatchObject({
        title: '料金',
        text: '準備しています…',
      });
    });

    it('タイトルがまだ届いていなければ「UI」と出す', () => {
      expect(
        chatArtifactOf(
          {
            type: 'tool-generate_ui',
            toolCallId: 'call-empty',
            state: 'input-streaming',
            input: undefined,
          },
          receiving,
        ),
      ).toMatchObject({ title: 'UI' });
    });

    it('base が null の呼び出しは、新しく作るものとして版を添えない', () => {
      expect(
        chatArtifactOf(
          { ...parts.thinking, input: { ...INPUT, base: null } },
          receiving,
        ),
      ).toMatchObject({ editingVersion: null });
    });

    it('確定の出力が preliminary で届いたあいだは、まだ描いているものとして出す', () => {
      expect(
        chatArtifactOf({ ...parts.done, preliminary: true }, receiving),
      ).toMatchObject({
        state: 'generating',
        text: '描いています…',
        spec: BUTTON,
      });
    });
  });
});

describe('chatArtifactOf のスライド', () => {
  describe('正常系', () => {
    it('確定の出力は、デッキの source と要約と版を出す', () => {
      expect(chatArtifactOf(slidesParts.done, notLive)).toStrictEqual({
        kind: 'slides',
        toolCallId: 'slides-done',
        title: 'TypeScript 入門',
        source: DECK,
        text: '型の基礎を5枚にまとめました。',
        open: 'preview',
        state: 'done',
        artifactId: 's1t2u3v4w5x6',
        version: 1,
      });
    });

    it.each([
      ['考えている', slidesParts.thinking, '考えています…', null],
      ['書いている', slidesParts.writing, 'スライドを書いています…', DECK],
    ])(
      '%s途中の出力を受信しているあいだは、段階の文とボタンを出す',
      (_, part, text, source) => {
        expect(chatArtifactOf(part, receiving)).toMatchObject({
          kind: 'slides',
          state: 'generating',
          text,
          source,
          open: 'preview',
        });
      },
    );

    it('直しているあいだは、考えている途中でも土台の版を添える', () => {
      expect(chatArtifactOf(slidesParts.thinking, receiving)).toMatchObject({
        state: 'generating',
        editingVersion: 1,
      });
    });

    it('失敗は、表示用に直したエラーの文を出し、ボタンを出さない', () => {
      expect(chatArtifactOf(slidesParts.failed, receiving)).toStrictEqual({
        kind: 'slides',
        toolCallId: 'slides-failed',
        title: 'TypeScript 入門',
        source: null,
        text: 'スライドを読み取れませんでした: スライドが1枚もありません',
        open: null,
        state: 'failed',
      });
    });
  });

  describe('異常系', () => {
    it.each([
      ['受信が切れてサーバーを待つ', waiting],
      ['止めている', { live: 'receiving', isStopping: true } as const],
    ])(
      '考えている途中で%sあいだは、デッキが無いのでボタンを出さない',
      (_, live) => {
        expect(chatArtifactOf(slidesParts.thinking, live)).toMatchObject({
          state: 'generating',
          open: null,
        });
      },
    );

    it('考えている途中で止まったものは、デッキが無いのでボタンを出さない', () => {
      expect(chatArtifactOf(slidesParts.thinking, notLive)).toMatchObject({
        state: 'stopped',
        text: '途中で止まりました',
        open: null,
      });
    });

    it('書いている途中で止まったものは、途中までのデッキを開ける', () => {
      expect(chatArtifactOf(slidesParts.writing, notLive)).toMatchObject({
        state: 'stopped',
        source: DECK,
        open: 'partial',
      });
    });
  });

  describe('エッジケース', () => {
    it('タイトルがまだ届いていなければ「スライド」と出す', () => {
      expect(
        chatArtifactOf(
          {
            type: 'tool-generate_slides',
            toolCallId: 'slides-empty',
            state: 'input-streaming',
            input: undefined,
          },
          receiving,
        ),
      ).toMatchObject({ kind: 'slides', title: 'スライド', source: null });
    });

    it('確定の出力が preliminary で届いたあいだは、まだ書いているものとして出す', () => {
      expect(
        chatArtifactOf({ ...slidesParts.done, preliminary: true }, receiving),
      ).toMatchObject({
        state: 'generating',
        text: 'スライドを書いています…',
        source: DECK,
      });
    });
  });
});

describe('artifactErrorText', () => {
  describe('正常系', () => {
    it('先頭の「Error: 」を外す', () => {
      expect(
        artifactErrorText('Error: UI が見つかりません: artifactId x の版 1'),
      ).toBe('UI が見つかりません: artifactId x の版 1');
    });

    it('tool の時間の上限で止まったことを言い換える', () => {
      expect(artifactErrorText('TimeoutError: signal timed out')).toBe(
        '時間の上限に達したため止まりました',
      );
    });

    it('中断で止まったことを言い換える', () => {
      expect(artifactErrorText('AbortError: This operation was aborted')).toBe(
        '止まりました',
      );
    });

    it('300 文字までなら、切らずに出す', () => {
      expect(artifactErrorText(`Error: ${'あ'.repeat(300)}`)).toBe(
        'あ'.repeat(300),
      );
    });
  });

  describe('エッジケース', () => {
    it('長い検証エラーは、300 文字で切って … を付ける', () => {
      const issue = (key: string): string =>
        `[${key}] Unknown component type "DataGrid". Use one of: Stack, Grid, Button, Card, Badge, Heading, Alert, Callout, Spinner, S…`;
      const text = artifactErrorText(
        `Error: UI の検証エラーを直せませんでした: ${[issue('a'), issue('b'), issue('c')].join(' / ')}`,
      );

      expect(Array.from(text)).toHaveLength(301);
      expect(text).toMatch(
        /^UI の検証エラーを直せませんでした: \[a\] Unknown component type "DataGrid"\. .*…$/u,
      );
    });

    it('切るときに、サロゲートペアを途中で切らない', () => {
      expect(artifactErrorText(`Error: ${'🍣'.repeat(301)}`)).toBe(
        `${'🍣'.repeat(300)}…`,
      );
    });

    it('Error の toString でない文は、そのまま出す', () => {
      expect(
        artifactErrorText(
          '1時間あたりの上限に達しました。しばらく待ってから送ってください。',
        ),
      ).toBe(
        '1時間あたりの上限に達しました。しばらく待ってから送ってください。',
      );
    });
  });
});

describe('artifactLiveOf', () => {
  describe('正常系', () => {
    it('受信中なら receiving', () => {
      expect(
        artifactLiveOf({ status: 'streaming', isServerRunning: false }),
      ).toBe('receiving');
    });

    it('受信が切れてサーバーを待っているなら waiting', () => {
      expect(artifactLiveOf({ status: 'error', isServerRunning: true })).toBe(
        'waiting',
      );
    });

    it('どちらでもなければ null', () => {
      expect(
        artifactLiveOf({ status: 'ready', isServerRunning: false }),
      ).toBeNull();
    });
  });

  describe('エッジケース', () => {
    it('送ったばかりのあいだは、サーバーを待っていても生きている返答として扱わない', () => {
      expect(
        artifactLiveOf({ status: 'submitted', isServerRunning: true }),
      ).toBeNull();
    });
  });
});

describe('chatArtifactsOf', () => {
  describe('正常系', () => {
    it('会話の順に generate_ui のパーツを集め、最後の assistant だけを生きているものにする', () => {
      const artifacts = chatArtifactsOf(
        [
          user('u1'),
          assistant('a1', parts.drawing),
          user('u2'),
          assistant('a2', parts.repairing),
        ],
        receiving,
      );
      expect(
        artifacts.map((artifact) => [artifact.toolCallId, artifact.state]),
      ).toStrictEqual([
        ['call-drawing', 'stopped'],
        ['call-repairing', 'generating'],
      ]);
    });
  });

  describe('異常系', () => {
    it('最後が user なら、ひとつ前の assistant に途中の出力が残っていても生成中にしない', () => {
      const artifacts = chatArtifactsOf(
        [user('u1'), assistant('a1', parts.drawing), user('u2')],
        { live: 'waiting', isStopping: false },
      );
      expect(artifacts).toMatchObject([
        { toolCallId: 'call-drawing', state: 'stopped' },
      ]);
    });
  });
});

describe('lastCallKeyOf と shownArtifact', () => {
  const twoDone = chatArtifactsOf(
    [
      assistant('a1', parts.done),
      assistant('a2', { ...parts.done, toolCallId: 'call-done-2' }),
    ],
    notLive,
  );

  describe('正常系', () => {
    it('追従するなら、最後のパーツを出す', () => {
      expect(lastCallKeyOf(twoDone)).toBe('call-done-2');
      expect(shownArtifact(twoDone, { type: 'follow' })?.toolCallId).toBe(
        'call-done-2',
      );
    });

    it('固定したなら、最後が変わらないあいだは固定したパーツを出す', () => {
      expect(
        shownArtifact(twoDone, {
          type: 'pinned',
          toolCallId: 'call-done',
          lastCallKey: 'call-done-2',
        })?.toolCallId,
      ).toBe('call-done');
    });

    it('閉じたなら、最後が変わらないあいだは出さない', () => {
      expect(
        shownArtifact(twoDone, { type: 'closed', lastCallKey: 'call-done-2' }),
      ).toBeNull();
    });

    it('新しい生成が始まると、固定も閉じた状態も解けて最後を出す', () => {
      const started = chatArtifactsOf(
        [
          assistant('a1', parts.done),
          assistant('a2', { ...parts.done, toolCallId: 'call-done-2' }),
          assistant('a3', parts.inputAvailable),
        ],
        receiving,
      );
      expect(lastCallKeyOf(started)).toBe('call-input');
      expect(
        shownArtifact(started, {
          type: 'pinned',
          toolCallId: 'call-done',
          lastCallKey: 'call-done-2',
        })?.toolCallId,
      ).toBe('call-input');
      expect(
        shownArtifact(started, { type: 'closed', lastCallKey: 'call-done-2' })
          ?.toolCallId,
      ).toBe('call-input');
    });
  });

  describe('異常系', () => {
    it('エラーと spec の無い中断は追従の対象にせず、その前のパーツを出す', () => {
      const artifacts = chatArtifactsOf(
        [
          assistant('a1', parts.done),
          assistant('a2', parts.thinking, parts.failed),
        ],
        notLive,
      );
      expect(keysOf(artifacts)).toStrictEqual([
        'call-done',
        'call-thinking',
        'call-failed',
      ]);
      expect(shownArtifact(artifacts, { type: 'follow' })?.toolCallId).toBe(
        'call-done',
      );
    });

    it('最後の呼び出しは、ペインに出せない失敗や spec の無い中断も含めて決める', () => {
      expect(
        lastCallKeyOf(
          chatArtifactsOf(
            [
              assistant('a1', parts.done),
              assistant('a2', parts.thinking, parts.failed),
            ],
            notLive,
          ),
        ),
      ).toBe('call-failed');
    });

    describe('生成中に閉じるか固定したあとで、その生成が出せないまま終わっても、選んだ状態を保つ', () => {
      const whileGenerating = lastCallKeyOf(
        chatArtifactsOf(
          [
            assistant('a1', parts.done),
            assistant('a2', { ...parts.done, toolCallId: 'call-done-2' }),
            assistant('a3', { ...parts.thinking, toolCallId: 'call-z' }),
          ],
          receiving,
        ),
      );
      const endedWith = (part: UiToolPart): ChatArtifact[] =>
        chatArtifactsOf(
          [
            assistant('a1', parts.done),
            assistant('a2', { ...parts.done, toolCallId: 'call-done-2' }),
            assistant('a3', { ...part, toolCallId: 'call-z' }),
          ],
          notLive,
        );

      it.each([
        ['失敗した', parts.failed],
        ['spec の無いまま止まった', parts.thinking],
      ])('%sら、閉じたままにする', (_, part) => {
        expect(
          shownArtifact(endedWith(part), {
            type: 'closed',
            lastCallKey: whileGenerating,
          }),
        ).toBeNull();
      });

      it.each([
        ['失敗した', parts.failed],
        ['spec の無いまま止まった', parts.thinking],
      ])('%sら、固定したパーツを出し続ける', (_, part) => {
        expect(
          shownArtifact(endedWith(part), {
            type: 'pinned',
            toolCallId: 'call-done',
            lastCallKey: whileGenerating,
          })?.toolCallId,
        ).toBe('call-done');
      });
    });

    it('閉じるか固定したあとに新しい生成が始まれば、それが失敗しても解けたままにし、出せる最後を出す', () => {
      const failed = chatArtifactsOf(
        [
          assistant('a1', parts.done),
          assistant('a2', { ...parts.done, toolCallId: 'call-done-2' }),
          assistant('a3', parts.failed),
        ],
        notLive,
      );
      expect(
        shownArtifact(failed, { type: 'closed', lastCallKey: 'call-done-2' })
          ?.toolCallId,
      ).toBe('call-done-2');
      expect(
        shownArtifact(failed, {
          type: 'pinned',
          toolCallId: 'call-done',
          lastCallKey: 'call-done-2',
        })?.toolCallId,
      ).toBe('call-done-2');
    });

    it('spec を残して止まったものは追従の対象にする', () => {
      const artifacts = chatArtifactsOf(
        [assistant('a1', parts.done), assistant('a2', parts.drawing)],
        notLive,
      );
      expect(shownArtifact(artifacts, { type: 'follow' })).toMatchObject({
        toolCallId: 'call-drawing',
        state: 'stopped',
      });
    });

    it('固定したパーツが失敗に変わったら、最後を出す', () => {
      const artifacts = chatArtifactsOf(
        [
          assistant('a1', { ...parts.failed, toolCallId: 'call-pinned' }),
          assistant('a2', parts.done),
        ],
        notLive,
      );
      expect(
        shownArtifact(artifacts, {
          type: 'pinned',
          toolCallId: 'call-pinned',
          lastCallKey: 'call-done',
        })?.toolCallId,
      ).toBe('call-done');
    });

    it('固定した呼び出しが会話に無ければ、出せる最後のパーツを出す', () => {
      expect(
        shownArtifact(twoDone, {
          type: 'pinned',
          toolCallId: 'call-elsewhere',
          lastCallKey: 'call-done-2',
        })?.toolCallId,
      ).toBe('call-done-2');
    });

    it('固定した時点の最後の呼び出しが会話に無ければ、固定を解いて出せる最後のパーツを出す', () => {
      expect(
        shownArtifact(twoDone, {
          type: 'pinned',
          toolCallId: 'call-done',
          lastCallKey: 'call-elsewhere',
        })?.toolCallId,
      ).toBe('call-done-2');
    });
  });

  describe('エッジケース', () => {
    it('出せるパーツが無ければ、追従していても出さない', () => {
      const artifacts = chatArtifactsOf(
        [assistant('a1', parts.failed)],
        notLive,
      );
      expect(shownArtifact(artifacts, { type: 'follow' })).toBeNull();
    });

    it('生成中なら、まだ spec が無くても出す', () => {
      const artifacts = chatArtifactsOf(
        [user('u1'), assistant('a1', parts.inputStreaming)],
        receiving,
      );
      expect(shownArtifact(artifacts, { type: 'follow' })).toMatchObject({
        toolCallId: 'call-input',
        state: 'generating',
        spec: null,
      });
    });
  });
});

describe('paneVersionsOf', () => {
  const editingPricing = {
    ...EDIT_INPUT,
    base: { artifactId: 'pricing', version: 1 },
  };
  const doneOf = (
    toolCallId: string,
    artifactId: string,
    version: number,
    input: Extract<UiToolPart, { state: 'output-available' }>['input'] = INPUT,
  ): UiToolPart => ({
    ...parts.done,
    toolCallId,
    input,
    output: { ...parts.done.output, artifactId, version },
  });
  const versionsShowing = (
    artifacts: ChatArtifact[],
    toolCallId: string,
  ): ReturnType<typeof paneVersionsOf> =>
    paneVersionsOf(
      artifacts,
      shownArtifact(artifacts, {
        type: 'pinned',
        toolCallId,
        lastCallKey: lastCallKeyOf(artifacts),
      }),
    );

  describe('正常系', () => {
    it('出している版と同じ artifactId の、できた版だけを、会話の順に返す', () => {
      const artifacts = chatArtifactsOf(
        [
          assistant('a1', doneOf('call-v1', 'pricing', 1)),
          assistant('a2', doneOf('call-other', 'dashboard', 1)),
          assistant('a3', { ...parts.failed, input: editingPricing }),
          assistant('a4', { ...parts.drawing, input: editingPricing }),
          assistant('a5', doneOf('call-v2', 'pricing', 2)),
          assistant('a6', {
            ...parts.repairing,
            toolCallId: 'call-editing',
            input: editingPricing,
          }),
        ],
        receiving,
      );

      expect(versionsShowing(artifacts, 'call-v1')).toStrictEqual([
        { toolCallId: 'call-v1', version: 1 },
        { toolCallId: 'call-v2', version: 2 },
      ]);
    });

    it('前の版を土台に直した版も、同じ UI の版として並べる', () => {
      const artifacts = chatArtifactsOf(
        [
          assistant('a1', doneOf('call-v1', 'pricing', 1)),
          assistant('a2', doneOf('call-v2', 'pricing', 2)),
          assistant('a3', doneOf('call-v3', 'pricing', 3, editingPricing)),
        ],
        notLive,
      );

      expect(versionsShowing(artifacts, 'call-v3')).toStrictEqual([
        { toolCallId: 'call-v1', version: 1 },
        { toolCallId: 'call-v2', version: 2 },
        { toolCallId: 'call-v3', version: 3 },
      ]);
    });
  });

  describe('エッジケース', () => {
    it('版が1つなら、その1つだけを返す', () => {
      const artifacts = chatArtifactsOf(
        [
          assistant('a1', doneOf('call-v1', 'pricing', 1)),
          assistant('a2', doneOf('call-other', 'dashboard', 1)),
        ],
        notLive,
      );

      expect(versionsShowing(artifacts, 'call-other')).toStrictEqual([
        { toolCallId: 'call-other', version: 1 },
      ]);
    });

    it.each([
      [
        '生成中',
        chatArtifactsOf(
          [
            assistant('a1', doneOf('call-v1', 'pricing', 1)),
            assistant('a2', doneOf('call-v2', 'pricing', 2)),
            assistant('a3', {
              ...parts.repairing,
              toolCallId: 'call-shown',
              input: editingPricing,
            }),
          ],
          receiving,
        ),
      ],
      [
        '止めた途中',
        chatArtifactsOf(
          [
            assistant('a1', doneOf('call-v1', 'pricing', 1)),
            assistant('a2', doneOf('call-v2', 'pricing', 2)),
            assistant('a3', {
              ...parts.repairing,
              toolCallId: 'call-shown',
              input: editingPricing,
            }),
          ],
          notLive,
        ),
      ],
    ])('出している UI が%sなら、空を返す', (_, artifacts) => {
      expect(versionsShowing(artifacts, 'call-shown')).toStrictEqual([]);
    });

    it('ペインに何も出していなければ、空を返す', () => {
      const artifacts = chatArtifactsOf(
        [
          assistant('a1', doneOf('call-v1', 'pricing', 1)),
          assistant('a2', doneOf('call-v2', 'pricing', 2)),
        ],
        notLive,
      );

      expect(paneVersionsOf(artifacts, null)).toStrictEqual([]);
    });
  });
});

describe('UI とスライドが混ざった会話', () => {
  describe('正常系', () => {
    it('kind を問わず会話の順に集め、追従は新しい呼び出しへ移る', () => {
      const artifacts = chatArtifactsOf(
        [assistant('a1', parts.done), assistant('a2', slidesParts.writing)],
        receiving,
      );
      expect(
        artifacts.map((artifact) => [artifact.toolCallId, artifact.kind]),
      ).toStrictEqual([
        ['call-done', 'ui'],
        ['slides-writing', 'slides'],
      ]);
      expect(shownArtifact(artifacts, { type: 'follow' })?.toolCallId).toBe(
        'slides-writing',
      );
    });

    it('UI を固定していても、スライドの生成が始まると固定が解ける', () => {
      const pinned = {
        type: 'pinned',
        toolCallId: 'call-done',
        lastCallKey: 'call-done-2',
      } as const;
      const artifacts = chatArtifactsOf(
        [
          assistant('a1', parts.done),
          assistant('a2', { ...parts.done, toolCallId: 'call-done-2' }),
          assistant('a3', slidesParts.inputAvailable),
        ],
        receiving,
      );
      expect(shownArtifact(artifacts, pinned)?.toolCallId).toBe('slides-input');
    });

    it('同じ artifactId のスライドの版だけを並べ、UI の版を混ぜない', () => {
      const artifacts = chatArtifactsOf(
        [
          assistant('a1', parts.done),
          assistant('a2', slidesParts.done),
          assistant('a3', {
            ...slidesParts.done,
            toolCallId: 'slides-done-2',
            input: SLIDES_EDIT_INPUT,
            output: { ...slidesParts.done.output, version: 2 },
          }),
        ],
        notLive,
      );
      expect(
        paneVersionsOf(artifacts, shownArtifact(artifacts, { type: 'follow' })),
      ).toStrictEqual([
        { toolCallId: 'slides-done', version: 1 },
        { toolCallId: 'slides-done-2', version: 2 },
      ]);
    });
  });

  describe('異常系', () => {
    it('考えている途中で止まったスライドは追従の対象にせず、その前の UI を出す', () => {
      const artifacts = chatArtifactsOf(
        [assistant('a1', parts.done), assistant('a2', slidesParts.thinking)],
        notLive,
      );
      expect(shownArtifact(artifacts, { type: 'follow' })?.toolCallId).toBe(
        'call-done',
      );
    });
  });
});
