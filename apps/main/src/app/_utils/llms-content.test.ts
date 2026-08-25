import { getBlogContents } from '@/features/blog/interface/queries';
import { getTalks } from '@/features/talks/interface/queries';

import { generateLlmsContent } from './llms-content';

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
}));
vi.mock('@/features/blog/interface/queries', () => ({
  getBlogContents: vi.fn(),
}));
vi.mock('@/features/talks/interface/queries', () => ({
  getTalks: vi.fn(),
}));
vi.mock('@/app/_components/playgrounds', () => ({
  playgroundSections: [
    {
      id: 'sample-demo',
      title: 'サンプルデモ',
      description: 'デモの説明。',
      category: 'css',
      demos: [],
      type: 'standalone',
    },
  ],
}));
vi.mock('@/shared/site/site-entries', () => ({
  siteEntries: [
    {
      title: 'Blog',
      link: '/blog',
      description: 'ブログの説明。',
      kind: 'reading',
      icon: 'blog',
    },
    {
      title: 'Talks',
      link: '/talks',
      description: 'トークの説明。',
      kind: 'reading',
      icon: 'talks',
    },
    {
      title: 'Playgrounds',
      link: '/playgrounds',
      description: 'Playgroundsの説明。',
      kind: 'reading',
      icon: 'playgrounds',
    },
    {
      title: 'External Tool',
      link: 'https://example.com/tool',
      description: '外部ツールの説明。',
      kind: 'tool',
      icon: 'fluida',
    },
  ],
}));

type BlogContent = Awaited<ReturnType<typeof getBlogContents>>[number];
type Talk = Awaited<ReturnType<typeof getTalks>>[number];

const blog = (overrides: Partial<BlogContent> = {}): BlogContent => ({
  id: 1,
  slug: 'sample-post',
  tags: ['CSS', 'React'],
  title: 'サンプル記事',
  description: '記事の説明。',
  createdAt: '2026-01-05T12:00:00.000Z',
  updatedAt: '2026-01-06T00:00:00.000Z',
  readingTime: 3,
  ...overrides,
});

const talk = (overrides: Partial<Talk> = {}): Talk => ({
  id: 1,
  title: 'サンプルトーク',
  eventUrl: 'https://example.com/event',
  eventName: 'サンプルイベント',
  eventDate: '2026-02-01',
  eventLocation: null,
  slideUrl: 'https://example.com/slide',
  blogId: 1,
  blog: { id: 1, slug: 'sample-post' },
  tags: [{ id: 1, name: 'CSS' }],
  ...overrides,
});

describe('generateLlmsContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getBlogContents).mockResolvedValue([]);
    vi.mocked(getTalks).mockResolvedValue([]);
  });

  describe('正常系', () => {
    it('ブログ記事をMarkdownリンク・日付・説明・タグつきで載せるべき', async () => {
      vi.mocked(getBlogContents).mockResolvedValue([blog()]);

      const content = await generateLlmsContent();

      expect(content).toContain(
        '#### [サンプル記事](https://k8o.me/blog/sample-post)（2026-01-05）\n記事の説明。\nタグ: CSS, React',
      );
    });

    it('トークをイベントとスライドのMarkdownリンクつきで載せるべき', async () => {
      vi.mocked(getTalks).mockResolvedValue([talk()]);

      const content = await generateLlmsContent();

      expect(content).toContain(
        '#### サンプルトーク\nサンプルイベント（2026-02-01）\n[イベント](https://example.com/event) / [スライド](https://example.com/slide)',
      );
    });

    it('ページ一覧のエントリを内部・外部ともMarkdownリンクにするべき', async () => {
      const content = await generateLlmsContent();

      expect(content).toContain(
        '### [Blog](https://k8o.me/blog)\nブログの説明。',
      );
      expect(content).toContain(
        '### [External Tool](https://example.com/tool)\n外部ツールの説明。',
      );
    });

    it('PlaygroundsのエントリにセクションのMarkdownリンクを載せるべき', async () => {
      const content = await generateLlmsContent();

      expect(content).toContain(
        '#### [サンプルデモ](https://k8o.me/playgrounds/sample-demo)\nデモの説明。',
      );
    });

    it('使いどころ・サイト情報・開発者向けリソースの節を含むべき', async () => {
      const content = await generateLlmsContent();

      expect(content).toContain('## このサイトの使いどころ');
      expect(content).toContain('## サイト情報');
      expect(content).toContain('## 開発者向けリソース');
    });
  });

  describe('エッジケース', () => {
    it('descriptionがnullのブログは説明行を出さないべき', async () => {
      vi.mocked(getBlogContents).mockResolvedValue([
        blog({ description: null }),
      ]);

      const content = await generateLlmsContent();

      expect(content).toContain(
        '#### [サンプル記事](https://k8o.me/blog/sample-post)（2026-01-05）\nタグ: CSS, React',
      );
    });

    it('タグが空のブログはタグ行を出さないべき', async () => {
      vi.mocked(getBlogContents).mockResolvedValue([blog({ tags: [] })]);

      const content = await generateLlmsContent();

      expect(content).not.toContain('タグ:');
      expect(content).toContain(
        '#### [サンプル記事](https://k8o.me/blog/sample-post)（2026-01-05）\n記事の説明。',
      );
    });

    it('slideUrlが空のトークはイベントリンクだけを載せるべき', async () => {
      vi.mocked(getTalks).mockResolvedValue([talk({ slideUrl: '' })]);

      const content = await generateLlmsContent();

      expect(content).toContain(
        '#### サンプルトーク\nサンプルイベント（2026-02-01）\n[イベント](https://example.com/event)',
      );
      expect(content).not.toContain('[スライド]');
    });
  });
});
