import { describe, expect, it } from 'vitest';

import type { AgentUIMessage } from './agent-message';
import { dropThinkingOnlySteps } from './drop-thinking-only-steps';

type AgentPart = AgentUIMessage['parts'][number];

const assistant = (parts: AgentPart[]): AgentUIMessage => ({
  id: 'a0',
  role: 'assistant',
  parts,
  metadata: { end: 'stopped' },
});

const reasoning: AgentPart = {
  type: 'reasoning',
  text: 'UI を作る',
  state: 'done',
  providerMetadata: { anthropic: { signature: 'sig' } },
};

const messageStart: AgentPart = {
  type: 'custom',
  kind: 'anthropic.message_start',
  providerMetadata: { anthropic: { id: 'msg_1' } },
};

const uiInput = { title: '確認ボタン', instruction: 'OK のボタンを置く' };

const preliminaryUi: AgentPart = {
  type: 'tool-generate_ui',
  toolCallId: 'call-ui',
  state: 'output-available',
  input: uiInput,
  output: { status: 'generating', phase: 'drawing', spec: null },
  preliminary: true,
};

const listedBlogs: AgentPart = {
  type: 'tool-list_blogs',
  toolCallId: 'call-list',
  state: 'output-available',
  input: {},
  output: { items: [] },
};

describe('dropThinkingOnlySteps', () => {
  describe('正常系', () => {
    it('結果の届かなかった tool の呼び出しと thinking だけのステップを落とす', () => {
      expect(
        dropThinkingOnlySteps([
          assistant([
            { type: 'step-start' },
            messageStart,
            reasoning,
            listedBlogs,
            { type: 'step-start' },
            messageStart,
            reasoning,
            preliminaryUi,
          ]),
        ]),
      ).toStrictEqual([
        assistant([
          { type: 'step-start' },
          messageStart,
          reasoning,
          listedBlogs,
        ]),
      ]);
    });

    it('文のあるステップは、結果の届かなかった tool の呼び出しがあっても残す', () => {
      const parts: AgentPart[] = [
        { type: 'step-start' },
        reasoning,
        { type: 'text', text: '作ります', state: 'done' },
        preliminaryUi,
      ];

      expect(dropThinkingOnlySteps([assistant(parts)])).toStrictEqual([
        assistant(parts),
      ]);
    });

    it.each([
      ['結果の届いた tool', listedBlogs],
      [
        'エラーで終わった tool',
        {
          type: 'tool-generate_ui',
          toolCallId: 'call-ui',
          state: 'output-error',
          input: uiInput,
          errorText: 'Error: UI は変わりませんでした',
        } satisfies AgentPart,
      ],
    ])(
      'thinking のあとに%sがあるステップは残す',
      (_label, toolPart: AgentPart) => {
        const parts: AgentPart[] = [
          { type: 'step-start' },
          reasoning,
          toolPart,
        ];

        expect(dropThinkingOnlySteps([assistant(parts)])).toStrictEqual([
          assistant(parts),
        ]);
      },
    );
  });

  describe('エッジケース', () => {
    it('user のメッセージには触れない', () => {
      const user: AgentUIMessage = {
        id: 'u0',
        role: 'user',
        parts: [{ type: 'text', text: 'UI を作って' }],
      };

      expect(dropThinkingOnlySteps([user])).toStrictEqual([user]);
    });

    it('入力の途中で止まった tool の呼び出しも、結果の届かなかったものとして扱う', () => {
      expect(
        dropThinkingOnlySteps([
          assistant([
            { type: 'step-start' },
            reasoning,
            {
              type: 'tool-generate_ui',
              toolCallId: 'call-ui',
              state: 'input-streaming',
              input: { title: '確認' },
            },
          ]),
        ]),
      ).toStrictEqual([assistant([])]);
    });
  });
});
