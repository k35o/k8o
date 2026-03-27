import { read } from 'to-vfile';
import { matter } from 'vfile-matter';

type Frontmatter = {
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const getFrontmatter = async (path: string): Promise<Frontmatter> => {
  const file = await read(path);
  matter(file);
  return file.data['matter'] as Frontmatter;
};

if (import.meta.vitest) {
  const { afterEach, describe, expect, it } = import.meta.vitest;

  describe('getFrontmatter', () => {
    const tempPaths: string[] = [];

    afterEach(async () => {
      const { rm } = await import('node:fs/promises');
      await Promise.all(
        tempPaths.map((path) => rm(path, { recursive: true, force: true })),
      );
      tempPaths.length = 0;
    });

    it('MDXファイルのfrontmatterを取得できる', async () => {
      const { mkdtemp, writeFile } = await import('node:fs/promises');
      const { tmpdir } = await import('node:os');
      const { join } = await import('node:path');

      const dir = await mkdtemp(join(tmpdir(), 'frontmatter-'));
      const filePath = join(dir, 'article.mdx');
      tempPaths.push(filePath);
      tempPaths.push(dir);

      await writeFile(
        filePath,
        `---
title: テスト記事
description: 説明文
createdAt: 2026-03-01T00:00:00.000Z
updatedAt: 2026-03-02T00:00:00.000Z
---

本文
`,
      );

      const result = await getFrontmatter(filePath);

      expect(result.title).toBe('テスト記事');
      expect(result.description).toBe('説明文');
      expect(result.createdAt).toBe('2026-03-01T00:00:00.000Z');
      expect(result.updatedAt).toBe('2026-03-02T00:00:00.000Z');
    });
  });
}
