import { asSchema } from 'ai';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchOwnerBlogMarkdown,
  fetchOwnerBlogs,
} from '../infrastructure/owner-api';
import type { OwnerBlog } from '../infrastructure/owner-api';
import { generateUi } from './generate-ui';
import type * as generateUiModule from './generate-ui';
import { agentTools } from './tools';

vi.mock('server-only', () => ({}));
vi.mock('@/features/usage/infrastructure/usage-repository', () => ({
  insertUsageWithinLimits: vi.fn(),
  selectCostSinceMicroUsd: vi.fn(),
  updateUsageCost: vi.fn(),
}));
vi.mock('@/features/artifacts/infrastructure/artifact-repository', () => ({
  insertArtifactWithFirstVersion: vi.fn(),
  insertNextVersion: vi.fn(),
  selectVersion: vi.fn(),
}));
vi.mock('../infrastructure/owner-api', () => ({
  fetchOwnerBlogs: vi.fn(),
  fetchOwnerBlogMarkdown: vi.fn(),
}));
vi.mock('./generate-ui', async (importOriginal) => ({
  ...(await importOriginal<typeof generateUiModule>()),
  generateUi: vi.fn(),
}));

const blog = (description: string): OwnerBlog => ({
  slug: 'arianotify',
  title: 'ariaNotify()でスクリーンリーダーに任意の文字列を読み上げさせる',
  description,
  tags: ['a11y'],
  publishedAt: '2026-09-28T00:00:00.000Z',
  url: 'https://k8o.me/blog/arianotify',
});

const executionOptions = (
  abortSignal?: AbortSignal,
): Parameters<typeof agentTools.list_blogs.execute>[1] => ({
  toolCallId: 'call-1',
  messages: [],
  context: {},
  ...(abortSignal === undefined ? {} : { abortSignal }),
});

const listBlogs = (abortSignal?: AbortSignal): Promise<unknown> =>
  Promise.resolve(
    agentTools.list_blogs.execute({}, executionOptions(abortSignal)),
  );

const readBlog = (slug: string, abortSignal?: AbortSignal): Promise<unknown> =>
  Promise.resolve(
    agentTools.read_blog.execute({ slug }, executionOptions(abortSignal)),
  );

// モデルが出した tool の入力は、execute の前に SDK が inputSchema で検証する
const acceptsSlug = async (slug: string): Promise<boolean> => {
  const result = await asSchema(agentTools.read_blog.inputSchema).validate?.({
    slug,
  });
  return result?.success === true;
};

const acceptsUiInput = async (input: unknown): Promise<boolean> => {
  const result = await asSchema(agentTools.generate_ui.inputSchema).validate?.(
    input,
  );
  return result?.success === true;
};

beforeEach(() => {
  vi.mocked(fetchOwnerBlogs).mockResolvedValue([]);
  vi.mocked(fetchOwnerBlogMarkdown).mockResolvedValue('# 本文');
});

describe('list_blogs', () => {
  describe('正常系', () => {
    it('オーナー API の記事の一覧を items にして返す', async () => {
      vi.mocked(fetchOwnerBlogs).mockResolvedValue([blog('短い説明')]);

      await expect(listBlogs()).resolves.toStrictEqual({
        items: [blog('短い説明')],
      });
    });

    it('tool の中断のシグナルをオーナー API の呼び出しに渡す', async () => {
      const controller = new AbortController();

      await listBlogs(controller.signal);

      expect(fetchOwnerBlogs).toHaveBeenCalledExactlyOnceWith(
        controller.signal,
      );
    });
  });

  describe('異常系', () => {
    it('オーナー API の失敗は、そのまま tool のエラーにする', async () => {
      vi.mocked(fetchOwnerBlogs).mockRejectedValue(
        new Error('オーナー API の /owner/blogs が 500 を返しました'),
      );

      await expect(listBlogs()).rejects.toThrow(
        'オーナー API の /owner/blogs が 500 を返しました',
      );
    });
  });

  describe('エッジケース', () => {
    it('200 字を超える説明は 200 字で切り、続きがあることを … で示す', async () => {
      vi.mocked(fetchOwnerBlogs).mockResolvedValue([blog('あ'.repeat(201))]);

      await expect(listBlogs()).resolves.toStrictEqual({
        items: [blog(`${'あ'.repeat(200)}…`)],
      });
    });

    it('ちょうど 200 字の説明は切らない', async () => {
      vi.mocked(fetchOwnerBlogs).mockResolvedValue([blog('あ'.repeat(200))]);

      await expect(listBlogs()).resolves.toStrictEqual({
        items: [blog('あ'.repeat(200))],
      });
    });

    it('サロゲートペアの文字も 1 字と数え、途中で切らない', async () => {
      vi.mocked(fetchOwnerBlogs).mockResolvedValue([blog('🍣'.repeat(201))]);

      await expect(listBlogs()).resolves.toStrictEqual({
        items: [blog(`${'🍣'.repeat(200)}…`)],
      });
    });
  });
});

describe('read_blog', () => {
  describe('正常系', () => {
    it('記事の markdown を文字列のまま返す', async () => {
      vi.mocked(fetchOwnerBlogMarkdown).mockResolvedValue('# ariaNotify()');

      await expect(readBlog('arianotify')).resolves.toBe('# ariaNotify()');
      expect(fetchOwnerBlogMarkdown).toHaveBeenCalledExactlyOnceWith(
        'arianotify',
        undefined,
      );
    });

    it('tool の中断のシグナルをオーナー API の呼び出しに渡す', async () => {
      const controller = new AbortController();

      await readBlog('arianotify', controller.signal);

      expect(fetchOwnerBlogMarkdown).toHaveBeenCalledExactlyOnceWith(
        'arianotify',
        controller.signal,
      );
    });

    it('slug は英小文字・数字・ハイフンだけを受ける', async () => {
      await expect(acceptsSlug('react19-usereducer')).resolves.toBe(true);
    });
  });

  describe('異常系', () => {
    it('記事が無ければ、slug を添えて tool のエラーにする', async () => {
      vi.mocked(fetchOwnerBlogMarkdown).mockResolvedValue(null);

      await expect(readBlog('missing')).rejects.toThrow(
        '記事が見つかりません: missing',
      );
    });

    it.each(['../owner', 'Arianotify', 'aria_notify', ''])(
      'slug が %j なら、tool の入力として受けない',
      async (slug) => {
        await expect(acceptsSlug(slug)).resolves.toBe(false);
      },
    );
  });

  describe('エッジケース', () => {
    it('50,000 字を超える本文は 50,000 字で切り、全体の文字数を書き添える', async () => {
      vi.mocked(fetchOwnerBlogMarkdown).mockResolvedValue('あ'.repeat(50_001));

      await expect(readBlog('arianotify')).resolves.toBe(
        `${'あ'.repeat(50_000)}\n\n（ここで切り詰めました。全体は 50001 文字）`,
      );
    });

    it('ちょうど 50,000 字の本文は切らない', async () => {
      vi.mocked(fetchOwnerBlogMarkdown).mockResolvedValue('あ'.repeat(50_000));

      await expect(readBlog('arianotify')).resolves.toBe('あ'.repeat(50_000));
    });
  });
});

describe('generate_ui', () => {
  const context = {
    userId: 'u1',
    threadId: 'thread-1',
    model: 'claude-sonnet-5-5',
  } as const;
  const uiInput = { title: '確認ボタン', instruction: 'OK のボタンを置く' };

  describe('正常系', () => {
    // 既存のスレッドに残った tool の定義と1字でもずれると、送り返す thinking が落とされる
    it('Claude に送る description と入力の JSON Schema は、既存のスレッドに残った定義のまま', async () => {
      expect(agentTools.generate_ui.description).toBe(
        '@k8ordo/ui のコンポーネントで UI を作るか直し、利用者の画面のプレビューに出す。保存した UI の artifactId と版を返す',
      );
      expect(
        await asSchema(agentTools.generate_ui.inputSchema).jsonSchema,
      ).toStrictEqual({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          title: {
            type: 'string',
            minLength: 1,
            description: 'UI の短い名前。カードとプレビューの見出しになる',
          },
          base: {
            description:
              '前に作った UI を直すときに、土台にする版を指す。省くと新しい UI を作る',
            anyOf: [
              {
                type: 'object',
                properties: {
                  artifactId: {
                    type: 'string',
                    description: '直す UI の artifactId',
                  },
                  version: {
                    type: 'integer',
                    exclusiveMinimum: 0,
                    maximum: 9_007_199_254_740_991,
                    description: '土台にする版',
                  },
                },
                required: ['artifactId', 'version'],
                additionalProperties: false,
              },
              { type: 'null' },
            ],
          },
          instruction: {
            type: 'string',
            minLength: 1,
            description:
              '作る UI、または直す内容。UI を組む役はこの会話を読まないので、組むのに要ることをすべて書く',
          },
        },
        required: ['title', 'instruction'],
        additionalProperties: false,
      });
    });

    it('入力と、利用者・会話・モデルの文脈と、中断のシグナルを UI の生成に渡す', () => {
      const controller = new AbortController();

      agentTools.generate_ui.execute(uiInput, {
        toolCallId: 'call-1',
        messages: [],
        context,
        abortSignal: controller.signal,
      });

      expect(generateUi).toHaveBeenCalledExactlyOnceWith({
        input: uiInput,
        context,
        abortSignal: controller.signal,
      });
    });

    it.each([
      ['base を省いた入力', uiInput],
      ['base が null の入力', { ...uiInput, base: null }],
      [
        '版を指した base',
        { ...uiInput, base: { artifactId: 'a1b2c3d4e5f6', version: 2 } },
      ],
    ])('%s を受ける', async (_label, input) => {
      await expect(acceptsUiInput(input)).resolves.toBe(true);
    });
  });

  describe('異常系', () => {
    it.each([
      ['空のタイトル', { ...uiInput, title: '' }],
      ['空の指示', { ...uiInput, instruction: '' }],
      [
        '0 の版',
        { ...uiInput, base: { artifactId: 'a1b2c3d4e5f6', version: 0 } },
      ],
      [
        '整数でない版',
        { ...uiInput, base: { artifactId: 'a1b2c3d4e5f6', version: 1.5 } },
      ],
    ])('%s は受けない', async (_label, input) => {
      await expect(acceptsUiInput(input)).resolves.toBe(false);
    });
  });
});
