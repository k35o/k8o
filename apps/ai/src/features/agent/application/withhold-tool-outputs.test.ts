import { convertToModelMessages } from 'ai';
import { describe, expect, it } from 'vitest';

import type { AgentUIMessage } from './agent-message';
import { dropThinkingOnlySteps } from './drop-thinking-only-steps';
import type { WithholdsOutput } from './tools';
import {
  WITHHELD_OUTPUT_TEXT,
  withholdToolOutputs,
} from './withhold-tool-outputs';

type AgentPart = AgentUIMessage['parts'][number];

// tools.ts の値を読み込むと DB などの mock が要るので、分け方は手で書き、出力が文字列の read_blog を
// 保存しないものとして確かめる
const withholdsReadBlog: WithholdsOutput = {
  list_blogs: false,
  read_blog: true,
  generate_ui: false,
  generate_slides: false,
  list_github_repos: false,
  read_github_file: false,
  search_github_code: false,
  search_github_issues: false,
  read_github_issue: false,
  get_site_overview: false,
  list_inquiries: false,
  list_blog_stats: false,
  list_browser_reports: false,
};

const withholdsNothing: WithholdsOutput = {
  list_blogs: false,
  read_blog: false,
  generate_ui: false,
  generate_slides: false,
  list_github_repos: false,
  read_github_file: false,
  search_github_code: false,
  search_github_issues: false,
  read_github_issue: false,
  get_site_overview: false,
  list_inquiries: false,
  list_blog_stats: false,
  list_browser_reports: false,
};

const assistant = (parts: AgentPart[]): AgentUIMessage => ({
  id: 'a0',
  role: 'assistant',
  parts,
  metadata: { end: 'completed' },
});

const reasoning = (signature: string): AgentPart => ({
  type: 'reasoning',
  text: `${signature} の思考`,
  state: 'done',
  providerMetadata: { anthropic: { signature } },
});

const messageStart: AgentPart = {
  type: 'custom',
  kind: 'anthropic.message_start',
  providerMetadata: { anthropic: { id: 'msg_1' } },
};

const ARTICLE = '# ariaNotify() の本文';

const readArticle = (toolCallId = 'call-read'): AgentPart => ({
  type: 'tool-read_blog',
  toolCallId,
  state: 'output-available',
  input: { slug: 'arianotify' },
  output: ARTICLE,
});

const withheldArticle = (toolCallId = 'call-read'): AgentPart => ({
  type: 'tool-read_blog',
  toolCallId,
  state: 'output-available',
  input: { slug: 'arianotify' },
  output: WITHHELD_OUTPUT_TEXT,
});

const listedBlogs: AgentPart = {
  type: 'tool-list_blogs',
  toolCallId: 'call-list',
  state: 'output-available',
  input: {},
  output: { items: [] },
};

const answer: AgentPart = { type: 'text', text: '要約です', state: 'done' };

// provider が実行する tool の代わりに、read_blog に providerExecuted を付けて確かめる
const serverResult: AgentPart = {
  type: 'tool-read_blog',
  toolCallId: 'srvtoolu_1',
  providerExecuted: true,
  state: 'output-available',
  input: { slug: 'arianotify' },
  output: ARTICLE,
  preliminary: false,
  callProviderMetadata: { anthropic: { caller: 'direct' } },
  resultProviderMetadata: { anthropic: { cached: false } },
};

const serverCall: AgentPart = {
  type: 'tool-read_blog',
  toolCallId: 'srvtoolu_1',
  providerExecuted: true,
  state: 'input-available',
  input: { slug: 'arianotify' },
  callProviderMetadata: { anthropic: { caller: 'direct' } },
};

const CITED_TEXT = '引用した元の文';

const citedAnswer: AgentPart = {
  type: 'text',
  text: '要約です',
  state: 'done',
  providerMetadata: {
    anthropic: {
      citations: [
        {
          type: 'web_search_result_location',
          url: 'https://example.com/',
          title: '元のページ',
          cited_text: CITED_TEXT,
          encrypted_index: 'enc',
        },
      ],
      signature: 'kept',
    },
    other: { kept: true },
  },
};

const uncitedAnswer: AgentPart = {
  type: 'text',
  text: '要約です',
  state: 'done',
  providerMetadata: {
    anthropic: { signature: 'kept' },
    other: { kept: true },
  },
};

describe('withholdToolOutputs', () => {
  describe('正常系', () => {
    it('保存しない tool の出力を決まった文に置き換え、output のほかの項目はそのまま残す', () => {
      expect(
        withholdToolOutputs(
          assistant([
            { type: 'step-start' },
            {
              type: 'tool-read_blog',
              toolCallId: 'call-read',
              title: '記事を読む',
              providerExecuted: false,
              state: 'output-available',
              input: { slug: 'arianotify' },
              output: ARTICLE,
              callProviderMetadata: { anthropic: { caller: 'direct' } },
              resultProviderMetadata: { anthropic: { cached: false } },
            },
          ]),
          withholdsReadBlog,
        ),
      ).toStrictEqual(
        assistant([
          { type: 'step-start' },
          {
            type: 'tool-read_blog',
            toolCallId: 'call-read',
            title: '記事を読む',
            providerExecuted: false,
            state: 'output-available',
            input: { slug: 'arianotify' },
            output:
              'この出力は保存していません。中身が要るときは、同じ入力でもう一度呼んでください',
            callProviderMetadata: { anthropic: { caller: 'direct' } },
            resultProviderMetadata: { anthropic: { cached: false } },
          },
        ]),
      );
    });

    it('置き換えた出力より後ろの reasoning を外し、前の reasoning は同じステップのものも残す', () => {
      expect(
        withholdToolOutputs(
          assistant([
            { type: 'step-start' },
            reasoning('sig-0'),
            listedBlogs,
            { type: 'step-start' },
            reasoning('sig-1'),
            readArticle(),
            { type: 'step-start' },
            reasoning('sig-2'),
            answer,
          ]),
          withholdsReadBlog,
        ),
      ).toStrictEqual(
        assistant([
          { type: 'step-start' },
          reasoning('sig-0'),
          listedBlogs,
          { type: 'step-start' },
          reasoning('sig-1'),
          withheldArticle(),
          { type: 'step-start' },
          answer,
        ]),
      );
    });

    it('置き換えた出力より後ろでも、保存する tool の出力と text と custom は残す', () => {
      expect(
        withholdToolOutputs(
          assistant([
            { type: 'step-start' },
            readArticle(),
            { type: 'step-start' },
            messageStart,
            answer,
            listedBlogs,
          ]),
          withholdsReadBlog,
        ),
      ).toStrictEqual(
        assistant([
          { type: 'step-start' },
          withheldArticle(),
          { type: 'step-start' },
          messageStart,
          answer,
          listedBlogs,
        ]),
      );
    });

    it('保存する tool の出力は、文字列でもそのまま残し、後ろの reasoning も外さない', () => {
      const message = assistant([
        { type: 'step-start' },
        reasoning('sig-1'),
        readArticle(),
        { type: 'step-start' },
        reasoning('sig-2'),
        answer,
      ]);

      expect(withholdToolOutputs(message, withholdsNothing)).toStrictEqual(
        message,
      );
    });

    it('provider が実行した tool は、結果の項目を落として呼び出しだけに戻し、input などほかの項目は残す', () => {
      expect(
        withholdToolOutputs(
          assistant([{ type: 'step-start' }, serverResult]),
          withholdsReadBlog,
        ),
      ).toStrictEqual(assistant([{ type: 'step-start' }, serverCall]));
    });

    it('呼び出しだけに戻した provider の tool より後ろの reasoning を外し、前の reasoning は残す', () => {
      expect(
        withholdToolOutputs(
          assistant([
            { type: 'step-start' },
            reasoning('sig-1'),
            serverResult,
            reasoning('sig-2'),
            answer,
          ]),
          withholdsReadBlog,
        ),
      ).toStrictEqual(
        assistant([
          { type: 'step-start' },
          reasoning('sig-1'),
          serverCall,
          answer,
        ]),
      );
    });

    it('text の引用（anthropic.citations）を外し、ほかの metadata と文は残す', () => {
      expect(
        withholdToolOutputs(
          assistant([{ type: 'step-start' }, serverResult, citedAnswer]),
          withholdsReadBlog,
        ),
      ).toStrictEqual(
        assistant([{ type: 'step-start' }, serverCall, uncitedAnswer]),
      );
    });
  });

  describe('異常系', () => {
    it('provider が実行した tool のエラーも、errorText を落として呼び出しだけにする', () => {
      expect(
        withholdToolOutputs(
          assistant([
            { type: 'step-start' },
            {
              type: 'tool-read_blog',
              toolCallId: 'srvtoolu_1',
              providerExecuted: true,
              state: 'output-error',
              input: { slug: 'arianotify' },
              errorText:
                '{"type":"web_search_tool_result_error","errorCode":"unavailable"}',
              callProviderMetadata: { anthropic: { caller: 'direct' } },
              resultProviderMetadata: { anthropic: { cached: false } },
            },
            reasoning('sig-2'),
          ]),
          withholdsReadBlog,
        ),
      ).toStrictEqual(assistant([{ type: 'step-start' }, serverCall]));
    });

    it('エラーで終わった呼び出しは、errorText を残し、後ろの reasoning も外さない', () => {
      const message = assistant([
        { type: 'step-start' },
        reasoning('sig-1'),
        {
          type: 'tool-read_blog',
          toolCallId: 'call-read',
          state: 'output-error',
          input: { slug: 'missing' },
          errorText: 'Error: 記事が見つかりません: missing',
        },
        { type: 'step-start' },
        reasoning('sig-2'),
        answer,
      ]);

      expect(withholdToolOutputs(message, withholdsReadBlog)).toStrictEqual(
        message,
      );
    });
  });

  describe('エッジケース', () => {
    it('結果の届かなかった呼び出しは置き換えず、後ろの reasoning も外さない', () => {
      const message = assistant([
        { type: 'step-start' },
        {
          type: 'tool-read_blog',
          toolCallId: 'call-read',
          state: 'input-available',
          input: { slug: 'arianotify' },
        },
        reasoning('sig-2'),
      ]);

      expect(withholdToolOutputs(message, withholdsReadBlog)).toStrictEqual(
        message,
      );
    });

    it('置き換える出力が2つあれば両方を置き換え、最初のものより後ろの reasoning をすべて外す', () => {
      expect(
        withholdToolOutputs(
          assistant([
            { type: 'step-start' },
            reasoning('sig-1'),
            readArticle('call-read-1'),
            { type: 'step-start' },
            reasoning('sig-2'),
            readArticle('call-read-2'),
            { type: 'step-start' },
            reasoning('sig-3'),
            answer,
          ]),
          withholdsReadBlog,
        ),
      ).toStrictEqual(
        assistant([
          { type: 'step-start' },
          reasoning('sig-1'),
          withheldArticle('call-read-1'),
          { type: 'step-start' },
          withheldArticle('call-read-2'),
          { type: 'step-start' },
          answer,
        ]),
      );
    });

    it('外したあとに thinking だけになったステップは、送る前に dropThinkingOnlySteps で落ちる', () => {
      const saved = withholdToolOutputs(
        assistant([
          { type: 'step-start' },
          reasoning('sig-1'),
          readArticle(),
          { type: 'step-start' },
          messageStart,
          reasoning('sig-2'),
        ]),
        withholdsReadBlog,
      );

      expect(dropThinkingOnlySteps([saved])).toStrictEqual([
        assistant([
          { type: 'step-start' },
          reasoning('sig-1'),
          withheldArticle(),
        ]),
      ]);
    });

    // client の tool と並べて呼ぶと、API は provider の tool を次の要求に回し、結果は前のステップの
    // パーツに入る
    it('結果が前のステップのパーツに入った provider の tool も呼び出しだけにして、後ろのステップの reasoning を外す', () => {
      expect(
        withholdToolOutputs(
          assistant([
            { type: 'step-start' },
            reasoning('sig-1'),
            serverResult,
            listedBlogs,
            { type: 'step-start' },
            reasoning('sig-2'),
            answer,
          ]),
          withholdsReadBlog,
        ),
      ).toStrictEqual(
        assistant([
          { type: 'step-start' },
          reasoning('sig-1'),
          serverCall,
          listedBlogs,
          { type: 'step-start' },
          answer,
        ]),
      );
    });

    it('呼び出しだけにしたあとに送る形にすると、provider の tool の呼び出しも結果も送らない', async () => {
      const saved = withholdToolOutputs(
        assistant([
          { type: 'step-start' },
          reasoning('sig-1'),
          { type: 'text', text: '調べます', state: 'done' },
          serverResult,
          reasoning('sig-2'),
          citedAnswer,
        ]),
        withholdsReadBlog,
      );

      await expect(
        convertToModelMessages(
          dropThinkingOnlySteps([
            {
              id: 'u1',
              role: 'user',
              parts: [{ type: 'text', text: '調べて' }],
            },
            saved,
          ]),
          { ignoreIncompleteToolCalls: true },
        ),
      ).resolves.toStrictEqual([
        { role: 'user', content: [{ type: 'text', text: '調べて' }] },
        {
          role: 'assistant',
          content: [
            {
              type: 'reasoning',
              text: 'sig-1 の思考',
              providerOptions: { anthropic: { signature: 'sig-1' } },
            },
            { type: 'text', text: '調べます' },
            {
              type: 'text',
              text: '要約です',
              providerOptions: {
                anthropic: { signature: 'kept' },
                other: { kept: true },
              },
            },
          ],
        },
      ]);
    });

    it('入力が流れている途中で終わった provider の tool は変えず、後ろの reasoning も外さない', () => {
      const message = assistant([
        { type: 'step-start' },
        {
          type: 'tool-read_blog',
          toolCallId: 'srvtoolu_1',
          providerExecuted: true,
          state: 'input-streaming',
          input: undefined,
        },
        reasoning('sig-2'),
      ]);

      expect(withholdToolOutputs(message, withholdsReadBlog)).toStrictEqual(
        message,
      );
    });
  });
});
