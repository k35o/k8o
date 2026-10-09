import { generateText } from 'ai';

import { summarizeArticle } from './article-summarizer';
import { fetchArticleText } from './article-text';

vi.mock('ai', () => ({
  generateText: vi.fn(),
}));

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: (modelId: string) => ({ modelId }),
}));

vi.mock('./article-text', () => ({
  fetchArticleText: vi.fn(),
}));

const ARTICLE = { url: 'https://example.com/a', title: '記事のタイトル' };
const BODY = 'Article body sentence. '.repeat(40);
const SUMMARY =
  'CSS の新しい機能を使って、要素同士の重なりを検出する方法を紹介している。スクロール駆動アニメーションを組み合わせ、JavaScript を使わずに重なりの状態に応じてスタイルを切り替える。対応ブラウザと、既存の手法との違いにも触れている。';

type GenerateTextResult = Awaited<ReturnType<typeof generateText>>;

const generated = (
  result: Partial<GenerateTextResult> & {
    text: string;
    finishReason: GenerateTextResult['finishReason'];
  },
): GenerateTextResult =>
  ({
    finalStep: { providerMetadata: undefined },
    ...result,
  }) as GenerateTextResult;

const promptOfFirstCall = (): unknown =>
  vi.mocked(generateText).mock.calls[0]?.[0].prompt;

describe('summarizeArticle', () => {
  beforeEach(() => {
    vi.mocked(fetchArticleText).mockResolvedValue({ ok: true, text: BODY });
  });

  describe('正常系', () => {
    it('Sonnet 5.5 に指示と記事を分けて渡し、要約を返す', async () => {
      vi.mocked(generateText).mockResolvedValue(
        generated({ text: SUMMARY, finishReason: 'stop' }),
      );

      const outcome = await summarizeArticle(ARTICLE);

      expect(outcome).toStrictEqual({ kind: 'summarized', summary: SUMMARY });
      expect(fetchArticleText).toHaveBeenCalledWith('https://example.com/a');
      const options = vi.mocked(generateText).mock.calls[0]?.[0];
      expect(options).toMatchObject({
        model: { modelId: 'claude-sonnet-5-5' },
        maxOutputTokens: 3000,
        timeout: 60_000,
        providerOptions: {
          anthropic: { effort: 'low', fallbacks: 'default' },
        },
      });
      expect(options).not.toHaveProperty('temperature');
      expect(options?.instructions).toContain('NO_ARTICLE_BODY');
      expect(promptOfFirstCall()).toBe(
        `<title>記事のタイトル</title>\n<article>\n${BODY}\n</article>`,
      );
    });

    it('要約に入った改行を取り除く', async () => {
      vi.mocked(generateText).mockResolvedValue(
        generated({
          text: `${SUMMARY.slice(0, 40)}\n${SUMMARY.slice(40)}\n`,
          finishReason: 'stop',
        }),
      );

      const outcome = await summarizeArticle(ARTICLE);

      expect(outcome).toStrictEqual({ kind: 'summarized', summary: SUMMARY });
    });
  });

  describe('異常系', () => {
    it('本文を取得できなければ、理由を付けてモデルを呼ばずに失敗にする', async () => {
      vi.mocked(fetchArticleText).mockResolvedValue({
        ok: false,
        reason: 'HTTP 404',
      });

      const outcome = await summarizeArticle(ARTICLE);

      expect(outcome).toStrictEqual({
        kind: 'failed',
        reason: '本文を取得できない（HTTP 404）',
      });
      expect(generateText).not.toHaveBeenCalled();
    });

    it('本文が短すぎれば、モデルを呼ばずに失敗にする', async () => {
      vi.mocked(fetchArticleText).mockResolvedValue({
        ok: true,
        text: 'Subscribe to read.',
      });

      const outcome = await summarizeArticle(ARTICLE);

      expect(outcome.kind).toBe('failed');
      expect(generateText).not.toHaveBeenCalled();
    });

    it.each([
      ['拒否された', 'content-filter'],
      ['上限で途中までしか生成されなかった', 'length'],
    ] as const)('%s出力は保存しない', async (_, finishReason) => {
      vi.mocked(generateText).mockResolvedValue(
        generated({ text: SUMMARY, finishReason }),
      );

      const outcome = await summarizeArticle(ARTICLE);

      expect(outcome.kind).toBe('failed');
    });

    it('記事の本文が無いと判断されたら失敗にする', async () => {
      vi.mocked(generateText).mockResolvedValue(
        generated({ text: 'NO_ARTICLE_BODY', finishReason: 'stop' }),
      );

      const outcome = await summarizeArticle(ARTICLE);

      expect(outcome.kind).toBe('failed');
    });

    it.each([
      ['句点で終わらない', SUMMARY.slice(0, -1)],
      ['短すぎる', 'Cloudflareは、AIの使い方を紹介している。'],
      ['長すぎる', SUMMARY.repeat(5)],
      ['見出しが入った', `## 要約\n${SUMMARY}`],
      ['箇条書きの', `- ${SUMMARY}\n- ${SUMMARY}`],
    ])('%s出力は要約として保存しない', async (_, text) => {
      vi.mocked(generateText).mockResolvedValue(
        generated({ text, finishReason: 'stop' }),
      );

      const outcome = await summarizeArticle(ARTICLE);

      expect(outcome.kind).toBe('failed');
    });

    it('API の呼び出しが失敗したら、例外のまま投げる', async () => {
      vi.mocked(generateText).mockRejectedValue(new Error('401'));

      await expect(summarizeArticle(ARTICLE)).rejects.toThrow('401');
    });
  });

  describe('エッジケース', () => {
    it('長い本文は先頭3万字に切り、切ったことを伝える', async () => {
      vi.mocked(fetchArticleText).mockResolvedValue({
        ok: true,
        text: 'a'.repeat(30_001),
      });
      vi.mocked(generateText).mockResolvedValue(
        generated({ text: SUMMARY, finishReason: 'stop' }),
      );

      await summarizeArticle(ARTICLE);

      expect(promptOfFirstCall()).toBe(
        `<title>記事のタイトル</title>\n<article truncated="true">\n${'a'.repeat(30_000)}\n</article>`,
      );
    });

    it('切る位置が絵文字の途中にかかっても、壊れた文字を API に送らない', async () => {
      vi.mocked(fetchArticleText).mockResolvedValue({
        ok: true,
        text: `${'a'.repeat(29_999)}😀`,
      });
      vi.mocked(generateText).mockResolvedValue(
        generated({ text: SUMMARY, finishReason: 'stop' }),
      );

      await summarizeArticle(ARTICLE);

      expect(String(promptOfFirstCall()).isWellFormed()).toBe(true);
    });
  });
});
